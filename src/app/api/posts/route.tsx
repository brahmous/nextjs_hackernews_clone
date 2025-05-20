import DB from "@/db"
import { IsError, MyError } from "@/server/types";

interface Blog {
	title: string;
  external_link: string;
  poste_date: number;
  author_username: string;
  upvotes: number;
  downvotes: number;
  comments: string[] /*TODO: update later with replies */
  blog_text: string;
}

export interface PostsRouteReturnType {
	blogs: Blog[];
};
export async function GET() {
	const read_posts_result = await DB().post_db.read_posts(50);
	if (IsError(read_posts_result)) {
		return Response.json({
			error_code: 2000,
			error_message: read_posts_result.error_message
		} as MyError);
	}

	return Response.json(read_posts_result.map((post)=> ({
		author_username: post.author.username,
		title: post.title,
		blog_text: post.text,
		external_link: post.external_link,
		comments: [] /* TODO: return from databse*/,
		downvotes: 0,
		poste_date: Date.now() /*TODO: Return from database*/,
		upvotes: 0
	} as Blog)));
}
