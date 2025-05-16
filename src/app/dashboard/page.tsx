import { RedirectIfNotLoggedIn } from "@/client/auth_guard";
import { VerifySession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Page() {
	console.log("/dashboard page")
	await VerifySession();
	return /*<RedirectIfNotLoggedIn> */<h1>Feed</h1> /*</RedirectIfNotLoggedIn>*/
}
