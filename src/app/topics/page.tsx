import { VerifySession } from "@/server/auth";

export default async function Page() {
	console.log("/topics page")
	await VerifySession();
	return /*<RedirectIfNotLoggedIn> */<h1>Feed</h1> /*</RedirectIfNotLoggedIn>*/
}
