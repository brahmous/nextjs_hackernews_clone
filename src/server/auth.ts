'use server'
import { FormSubmited, IsError, MyError, RegisterUserFormErrorLog, RegisterUserFormState } from "@/server/types"
import DB from "@/db";
import CACHE from "@/cache"
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginFormState } from "@/server/types";
import { hash, verify } from "argon2";
import { v4 as uuidv4 } from "uuid";
import { use } from "react";
import { IsCreateUserIfDoesntExistInputValidationLog } from "@/db/user";
import { create } from "domain";

export async function VerifySession(): Promise<boolean> {

	let redirect_flag: boolean = false;
	try {
		const cookie_store = await cookies();
		const session_id = cookie_store.get("session_id");

		if (!session_id || session_id && IsError(await CACHE().session_storage.sessionExists(session_id.value))) {
			redirect_flag = true;
		}
	} catch (err) {
		/*IDEA: Just return false?*/
		throw err;
	} finally {
		if (redirect_flag) {
			redirect("/");
		}
	}
	return true;
};

/* NOTE: this should return MyError
 * error list should be returned by saveUser function
 * velidation and saving the user must be moved to db function
 * return type: FormSubmited (boolean) | MyError | FormInputErrors
 * */
export async function RegisterUser(prev_state: RegisterUserFormState, formData: FormData): Promise<RegisterUserFormState> {

	const username = formData.get("username");
	const email = formData.get("email");
	const password = formData.get("password");

	const { user_db } = DB();

	let redirect_flag: boolean = false;
	try {
		const cookie_store = await cookies();
		
		const create_user_result = await user_db.create_user_if_doesnt_exist(
			{
				username: (username ? username.toString() : undefined),
				email: (email ? email.toString() : undefined),
				password: (password ? password.toString() : undefined),
			}
		);
		
		console.log({ create_user_result });
		
		if (IsError(create_user_result)) {
			return { error_code: create_user_result.error_code, error_message: create_user_result.error_message };
		}
		
		if (IsCreateUserIfDoesntExistInputValidationLog(create_user_result)) {
			return {
				username: create_user_result.username,
				emai: create_user_result.email,
				password: create_user_result.password
			} as RegisterUserFormErrorLog;
		}
		
		const session_id: string = uuidv4();
		const { session_storage } = CACHE();
		
		console.log("########################### {session: storage}"+session_id+"########################")
		const save_session_result = await session_storage.saveSessionIfDoesntExist(session_id, { user_id: create_user_result.email, expires_at: Date.now() });

		if (IsError(save_session_result)) {
			return {
				error_code: 2000,
				error_message: "error saving the session to the session store!"
			} as MyError;
		}
		
		const cookie_storage = await cookies();

		cookie_storage.set("session_id", session_id);

		console.log({save_session_result});

		redirect_flag = true;
	} catch (err) {
		throw err;
	} finally {
		//if (redirect_flag) redirect("/topics");
	}

	return true;
}

export async function LoginUser(prev_state: LoginFormState, formData: FormData): Promise<LoginFormState> {

	
	const email: string = formData.get("email")!.toString();
	const password: string = formData.get("password")!.toString();
	
	const { user_db } = DB();
	const { session_storage } = CACHE();
	
	try {
		const find_user_result = await user_db.find_user_by_email(email);
		
		if (IsError(find_user_result)) {
			return {
				error_code: find_user_result.error_code,
				error_message: find_user_result.error_message
			} as MyError;
		}
		
		if (!(await verify(find_user_result.password_hash, password))) {
			return {
				error_code: 2000,
				error_message: "Email or password are wrong!"
			} as MyError;
		}

		const session_id: string = uuidv4();
		const save_session_result = await session_storage.saveSessionIfDoesntExist(session_id,
			{
				user_id: find_user_result.id.toString(),
				expires_at: Date.now()
			});

		if (IsError(save_session_result)) {
			return { error_code: save_session_result.error_code, error_message: save_session_result.error_message };
		}

		const cookie_store = await cookies();
		cookie_store.set("session_id", session_id);

	} catch (err) {
		console.log("Error caught in LoguserIn()");
		throw err;
	}

	return true;
};

export async function Logout(): Promise<void | MyError> {
	const cookie_store = await cookies();
	const session_id = cookie_store.get("session_id");
	if (!session_id) {
		return {
			error_code: 2000,
			error_message: "Logout pressed when user is not logged in!"
		} as MyError;
	}
	cookie_store.delete("session_id");
}