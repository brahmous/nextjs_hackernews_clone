import { AuthContextType } from "@/client/auth-provider"
import CACHE from "@/cache"
import { cookies } from "next/headers";
import { IsError } from "@/server/types";

export async function GET() {
	const cookie_storage = await cookies();
	const cookie = cookie_storage.get("session_id");

	if (!cookie) /* No session id */ {
		return Response.json({
			logged_in: false
		} as AuthContextType);
	}

	const session_id: string = cookie.value;

	const find_session_result = await CACHE().session_storage.sessionExists(session_id);

	if (IsError(find_session_result)) {
		return Response.json({ logged_in: false } as AuthContextType);
	}

	console.log({ session_id });

	return Response.json({ logged_in: true } as AuthContextType);
}
