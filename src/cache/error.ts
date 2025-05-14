import { Error } from "./types";

export const CacheErrors = {
	SaveSessionError: (): Error => {
		return {
			error_code: 1000,
			error_message: "Unable to save user session"
		}
	}
};
