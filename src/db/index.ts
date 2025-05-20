import UserDB from "./user";
import PostDB from "./post"

interface database_controllers {
	user_db: UserDB;
	post_db: PostDB;
};

const controllers: database_controllers = {
	user_db: new UserDB(),
	post_db: new PostDB(),
};

export default function DB() {
	return controllers;
}
