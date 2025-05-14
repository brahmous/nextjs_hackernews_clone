import Redis from "@/lib/redis"
import { user_session_t, SaveSessionResponse } from "./types"
import { IsError, MyError } from "@/server/types";

export default class SessionStorage {

	async saveSession(session_id: string, user_session: user_session_t): Promise<SaveSessionResponse> {
		const client = await Redis();

		const result = await client.hSet(session_id, {
			"user_id": user_session.user_id,
			"expires_at": user_session.expires_at
		});
	}

	async sessionExists(session_id: string): Promise<void | MyError> {
		const client = await Redis();

		const exists_result = await client.exists(session_id);

		if (exists_result == 0) {
			return {
				error_code: 2300,
				error_message: "no session id in cache!"
			} as MyError;
		} else if (exists_result > 1) {
			return {
				error_code: 2301,
				error_message: "more than one session id in cache!"
			} as MyError;
		}
	}

	async saveSessionIfDoesntExist(session_id: string, user_session: user_session_t): Promise<SaveSessionResponse> {

		/*
		 * Check if session exists
		 * 	yes :> return error session already exists
		 *  no  :> save session and return success
		 * */
		const client = await Redis();
		try {
			if (await client.exists(session_id) == 0) {
				const save_session_result = await this.saveSession(session_id, user_session);

				if (IsError(save_session_result)) {
					return {
						error_code: save_session_result.error_code,
						error_message: save_session_result.error_message
					} as MyError;
				}

			} else {
				return {
					error_code: 2000,
					error_message: "Session id already exists!"
				} as MyError;
			}
		} catch (err) {
			console.log("caught error in saveSessionIfDoesntExist()");
			throw err;
		}
	}

	async destroySessionIfExists(session_id: string): Promise<void | MyError> {
		const client = await Redis();
		try {
			// If session id doesn't exist return error early.
			if (await client.exists(session_id) == 0) {
				return {
					error_code: 2000,
					error_message: "session doesn't exist!"
				} as MyError;
			}
			// Delete session id, return an error if you can't delete session_id that's known to exist.
			if (await client.del(session_id) == 0) {
				return {
					error_code: 2000,
					error_message: "error deleting existing session!"
				} as MyError;
			}
		} catch (err) {
			console.log("caught error in destroySessionIfExists()");
			throw err;
		}
	}

}
