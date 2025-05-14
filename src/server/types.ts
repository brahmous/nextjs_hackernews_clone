export interface MyError {
	error_code: number;
	error_message: string;
}

export type FormSubmited = boolean;
export type LoginFormState = FormSubmited | MyError;

interface FormInputState {
	[form_name: string]: string[];
}

export type RegisterUserFormState = FormSubmited | FormInputState[];

export function IsError(value: any): value is MyError {
	return (typeof value == "object" && value != undefined && "error_code" in value && "error_message" in value);
}

export function IsFormError(value: any): value is FormInputState[] {
	return Array.isArray(value);
}
