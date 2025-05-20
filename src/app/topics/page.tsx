import { HN_BlogViewer } from "@/client/blogs-list";
import { VerifySession } from "@/server/auth";

export default async function Page() {
	console.log("/topics page")
	await VerifySession();
	return 	<HN_BlogViewer blogs={[]}/>
}
