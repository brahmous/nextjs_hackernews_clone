import { AuthContextType } from "@/client/auth-provider"
import CACHE from "@/cache"
import { cookies } from "next/headers";
import { IsError, MyError } from "@/server/types";

export interface MeAPIRouteResponseType {

	logged_in: boolean;

};

export async function GET() {
	console.log("route hit!");
	const cookie_storage = await cookies();
	const cookie = cookie_storage.get("session_id");

	if (!cookie) /* No session id */ {
		return Response.json({
			logged_in: false
		} as MeAPIRouteResponseType);
	}

	const session_id: string = cookie.value;

	const find_session_result = await CACHE().session_storage.sessionExists(session_id);

	if (IsError(find_session_result)) {
		return Response.json({ ...find_session_result } as MyError);
	}

	console.log("HERHERHERHERH")
	return Response.json({ logged_in: true } as MeAPIRouteResponseType);
}
