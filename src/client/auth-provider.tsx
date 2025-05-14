'use client'

import { useEffect, useState, Dispatch, SetStateAction } from "react"
import { createContext } from "react";

export interface AuthContextType {
	logged_in: boolean;
};

export const AuthContext = createContext<AuthContextType & { set_auth?: Dispatch<SetStateAction<AuthContextType>> }>({ logged_in: false });

export function AuthProvider(props: { children: React.ReactNode }) {

	const [authSate, setAuthState] = useState<AuthContextType>({ logged_in: false });

	useEffect(() => {

		console.log("AuthProvider rendered...");

		async function getMe() {
			const fetch_result = await fetch("http://localhost:3000/api/me");
			const data: AuthContextType = await fetch_result.json();

			if (data.logged_in != authSate.logged_in) {
				setAuthState({ ...data });
			}
		}

		getMe();

	}, []);

	return (<AuthContext.Provider
		value={
			{
				logged_in: authSate.logged_in,
				set_auth: setAuthState
			}
		}
	>
		{props.children}
	</AuthContext.Provider>);
}; 
