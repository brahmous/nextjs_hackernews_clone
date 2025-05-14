import { on } from "events";
import { PrismaClient, Prisma } from "../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as argon2 from "argon2";

const prisma = new PrismaClient().$extends(withAccelerate())

const userData: Prisma.hn_userCreateInput[] = [
	{
		email: "nick@gmail.com",
		password: "hello",
		username: "nick"
	},
	{
		email: "ye@gmail.com",
		password: "hh",
		username: "ye"
	}
];

export async function main() {

	for (let U of userData) {


		await prisma.hn_user.create({
			data: {
				username: U.username,
				email: U.email,
				password: await argon2.hash(U.password)
			}
		});

	}

}

main();
