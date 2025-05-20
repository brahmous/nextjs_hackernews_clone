import { RedirectIfNotLoggedIn } from "@/client/auth-guard";
import { HN_BlogViewer } from "@/client/topic-viewer";
import { VerifySession } from "@/server/auth";

export default async function Page() {
	console.log("/topics page")
	await VerifySession();
	return /*<RedirectIfNotLoggedIn>*/	<HN_BlogViewer blogs={[]}/> /*</RedirectIfNotLoggedIn>*/
}
