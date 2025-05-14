import { MyError } from "@/server/types";

export interface user_session_t {
	user_id: string;
	expires_at: number;
};

export type SaveSessionResponse = void | MyError; 
