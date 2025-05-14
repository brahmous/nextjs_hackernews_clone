'use server'
import { IsError, MyError, RegisterUserFormState } from "@/server/types"
import DB from "@/db";
import CACHE from "@/cache"
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginFormState } from "@/server/types";
import { verify } from "argon2";
import { v4 as uuidv4 } from "uuid";

export async function VerifySession(): Promise<boolean> {

	let redirect_flag: boolean = false;
	try {
		const cookie_store = await cookies();
		const session_id = cookie_store.get("session_id");

		if (!session_id || session_id && IsError(await CACHE().session_storage.sessionExists(session_id.value))) {
			redirect_flag = true;
		}
	} catch (err) {
		console.log({ err });
		console.log("error caught in VerifySession()");
		/*IDEA: Just return false?*/
		throw err;
	} finally {
		if (redirect_flag) {
			redirect("/");
		}
		return true;
	}

};

export async function RegisterUser(prev_state: RegisterUserFormState, formData: FormData): Promise<RegisterUserFormState> {


	return false;
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
				user_id: email,
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
	} finally {
		redirect("/dashboard");
	}

};
