import prisma from "@/lib/prisma/prisma"
import { MyError } from "@/server/types";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { throws } from "assert";
import { asyncWrapProviders } from "async_hooks";
import { constrainedMemory } from "process";

interface CreateUserArgs {
	username: string;
	email: string;
	password_hash: string;
};

interface User {
	id: number;
	username: string;
	email: string;
	password_hash: string;
};

export default class UserTable {
	async CreateUser(args: CreateUserArgs): Promise<User | MyError> {
		try {
			const result = await prisma.hn_user.create({
				data: {
					email: args.email,
					password: args.password_hash,
					username: args.username
				}
			});
			console.log({ result });
			return {
				id: result.id,
				username: result.username,
				email: result.email,
				password_hash: result.password
			}
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				return { error_code: 2000, error_message: "todo: find error code and return and appropriate error message." }
			}
			throw err;
		}
	};

	async find_user_by_email(email: string): Promise<User | MyError> {
		try {
			const result = await prisma.hn_user.findUnique({
				where: { email }
			});
			/*
			 * Does not finding a user throw or return null??
			 * */
			console.log({ result })

			if (result) {
				return {
					id: result.id,
					username: result.username,
					email: result.email,
					password_hash: result.password
				}
			}

			return { error_code: 20033, error_message: "couldn't find user!" };
		}
		catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				return { error_code: 2000, error_message: "todo: find error code and return and appropriate error message." }
			}
			throw err;
		}
	}

	async find_user_by_id(id: number): Promise<User | MyError> {

		try {
			const { hn_user } = prisma;
			const find_by_id_result = await hn_user.findUnique({ where: { id } });

			if (find_by_id_result) {
				return {
					id: find_by_id_result.id,
					username: find_by_id_result.username,
					email: find_by_id_result.email,
					password_hash: find_by_id_result.password
				}
			} else {
				return { error_code: 2000, error_message: "no user id exists with given id!" }
			}

		} catch (err) {

			if (err instanceof PrismaClientKnownRequestError) {
				return { error_code: 2000, error_message: "Database error!" }
			}

			throw err;
		}
	}
}


const user_table = new UserTable();

async function test() {


	const result_found = await user_table.find_user_by_id(2);
	console.log({ result_found });

	const result_not_found = await user_table.find_user_by_id(200);
	console.log({ result_not_found });

}

test();

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


