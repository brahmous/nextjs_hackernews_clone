'use client'
import { useEffect } from "react";
import { useState } from "react";
import { LoginUser } from "@/server/auth";
import { IsError, LoginFormState } from "@/server/types"
import { useActionState } from "react";
import Form from "next/form";

//////////////////////////////////////////
// Client.
export function HN_Logo() {
	return <p className="cursor-pointer font-bold text-(length:--text-logo-size-1)">Hacker News</p>;
}

export function HN_LoginButton() {
	return (
		<button
			className="text-(length:--menu-text-size) font-normal">
			Login
		</button>
	);
}

export function HN_SignupButton() {
	return (
		<button
			className="text-(length:--menu-text-size) font-normal">
			Sign Up
		</button>
	);
}


export interface HN_HeaderProps {
	logged_in: boolean;
}

export function HN_Header(props: HN_HeaderProps) {

	useEffect(() => {
		console.log("HN_Header rendered.");
	});

	return (
		<div className="flex border justify-between py-2 px-5">
			<HN_Logo />
			<div className="flex justify-between gap-5 ">
				{!props.logged_in && <HN_LoginButton />} <HN_SignupButton />
			</div>
		</div>
	)
}

export function HN_LoginForm() {

	const [formState, setFormState] = useState<LoginFormState>();
	const [actionState, formAction, pending] = useActionState(LoginUser, false);

	useEffect(() => {

		if (IsError(actionState)) {
			console.log("hhhhhhhhhhheeeeeeeeeeeeerrrrrrrrrrrrrreeeeeeeeeeeeeee");
			setFormState(
				{
					error_code: actionState.error_code,
					error_message: actionState.error_message
				}
			);
		}

	}, [actionState]);

	return (
		<div /*Div to position the form.*/
			className="flex flex-col w-40 px-5 m-auto"
		>
			<p
				className="text-(length:--text-logo-size-1) py-2">
				Login
			</p>
			{IsError(formState) && <ul> <li className="text-[#ff0000]">{formState.error_message} </li> </ul>}
			<Form action={formAction}
				className="flex flex-col"
			>
				<label className="
						text-(length:--menu-text-size)">
					Email
					<input name="email" className="border" />
				</label>
				<label className="
						text-(length:--menu-text-size)">
					Password:
					<input name="password" type="password" className="border" />
				</label>
				<button type="submit"
					className="border
						text-(length:--menu-text-size)">
					Login
				</button>
			</Form>
		</div>
	);
}
