import UserDB from "./user";

interface database_controllers {
	user_db: UserDB;
};

const controllers: database_controllers = {
	user_db: new UserDB()
};

export default function DB() {
	return controllers;
}
