import { CreateUserIfDoesntExistInputArgs } from "@/db/user";

export interface MyError {
	error_code: number;
	error_message: string;
}

export type FormSubmited = boolean;
export type LoginFormState = FormSubmited | MyError;

/*
type KeyMapper<K, V> = {
	[key in keyof K]: V;
}
export type RegisterUserFormErrorLog = KeyMapper<CreateUserIfDoesntExistInputArgs, string[]>;
*/

export interface RegisterUserFormErrorLog {
	username: string[];
	emai: string[];
	password: string[];
};

export type RegisterUserFormState = FormSubmited | MyError | RegisterUserFormErrorLog;

export function IsError(value: any): value is MyError {
	return (typeof value == "object" && value != undefined && "error_code" in value && "error_message" in value);
}

export function IsRegisterUserFormError(value: any): value is RegisterUserFormErrorLog {
	return (typeof value == "object"
		&& value != undefined
		&& (
			"username" in value && Array.isArray(value.username)
			|| "email" in value && Array.isArray(value.email)
			|| "password" in value && Array.isArray(value.password))
	);
}
