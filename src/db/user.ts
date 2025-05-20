import prisma from '@/lib/prisma/prisma';
import { MyError } from '@/server/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z } from 'zod';

import * as Argon2 from 'argon2';

export interface CreateUserIfDoesntExistInputArgs {
  username?: string;
  email?: string;
  password?: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
}

export interface CreateUserIfDeosntExistInputValidationLog {
  username: string[];
  email: string[];
  password: string[];
  validation_errors_count: number;
}


/*
 * given a list of arguments
 * */

const CreateUserIfDoesntExistArgsSchema = z.object({
  username: z.string().min(4).trim(),
  email: z.string().email(),
  password: z.string().min(4),
});

export default class UserTable {
  async create_user_if_doesnt_exist(
    args: CreateUserIfDoesntExistInputArgs
  ): Promise<UserDTO & {password_hash: string}| MyError | CreateUserIfDeosntExistInputValidationLog> {
    let input_validation_log: CreateUserIfDeosntExistInputValidationLog = {
      username: [],
      email: [],
      password: [],
      validation_errors_count: 0,
    };

    const validated_fields = CreateUserIfDoesntExistArgsSchema.safeParse(args);

    if (!validated_fields.success) {
      const field_errors = validated_fields.error.flatten().fieldErrors;

      if (field_errors.username) {
        input_validation_log.username = field_errors.username;
        input_validation_log.validation_errors_count++;
      }

      if (field_errors.email) {
        input_validation_log.email = field_errors.email;
        input_validation_log.validation_errors_count++;
      }

      if (field_errors.password) {
        input_validation_log.password = field_errors.password;
        input_validation_log.validation_errors_count++;
      }

      return input_validation_log;
    }

    try {
      const result = await prisma.hn_user.create({
        data: {
          username: validated_fields.data.username,
          email: validated_fields.data.email,
          password: await Argon2.hash(validated_fields.data.password),
        },
      });

      return {
        id: result.id,
        username: result.username,
        email: result.email,
        password_hash: result.password,
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        // TODO: Check error code for unique constraint on email, ensure unique constraint is on email filed in databased
        return {
          error_code: 2000,
          error_message:
            'todo: find error code and return and appropriate error message.',
        };
      }
      throw err;
    }
  }

  async find_user_by_email(email: string): Promise<UserDTO & {password_hash: string} | MyError> {
    try {
      const result = await prisma.hn_user.findUnique({
        where: { email },
      });
      /*
       * Does not finding a user throw or return null??
       * */

      if (result) {
        return {
          id: result.id,
          username: result.username,
          email: result.email,
          password_hash: result.password,
        };
      }

      return { error_code: 20033, error_message: "couldn't find user!" };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        return {
          error_code: 2000,
          error_message:
            'todo: find error code and return and appropriate error message.',
        };
      }
      throw err;
    }
  }

  async find_user_by_id(id: number): Promise<UserDTO & {password_hash: string} | MyError> {
    try {
      const { hn_user } = prisma;
      const find_by_id_result = await hn_user.findUnique({ where: { id } });

      if (find_by_id_result) {
        return {
          id: find_by_id_result.id,
          username: find_by_id_result.username,
          email: find_by_id_result.email,
          password_hash: find_by_id_result.password,
        };
      } else {
        return {
          error_code: 2000,
          error_message: 'no user id exists with given id!',
        };
      }
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        return { error_code: 2000, error_message: 'Database error!' };
      }

      throw err;
    }
  }
}

/*
async function test() {
	try {
		const result = await user_table.CreateUser({
			email: "test@mail.com",
			password_hash: "test password hash",
			username: "test_username"
		});
	} catch (err) {
		if (err instanceof PrismaClientKnownRequestError) {
			console.log({ error_code: err.code });
		}

		throw err;
	}
}
test();
*/
