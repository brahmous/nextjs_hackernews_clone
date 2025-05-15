import { RedirectIfNotLoggedIn } from "@/client/redirect_if_logged_in";
import { VerifySession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Page() {
	await VerifySession();
	return /*<RedirectIfNotLoggedIn> */<h1>Feed</h1> /*</RedirectIfNotLoggedIn>*/
}
