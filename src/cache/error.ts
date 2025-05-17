import { MyError } from "@/server/types";

export const CacheErrors = {
	SaveSessionError: (): MyError => {
		return {
			error_code: 1000,
			error_message: "Unable to save user session"
		}
	}
};
