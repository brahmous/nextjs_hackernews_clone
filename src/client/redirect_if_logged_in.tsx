'use client'
import { useContext, useEffect } from "react"
import { AuthContext } from "./auth-provider";
import { useRouter } from "next/navigation";

export function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {

	const context = useContext(AuthContext);
	const router = useRouter();

	useEffect(() => {
		if (context.logged_in) {
			router.replace("/dashboard");
		}
	}, [context, router]);

	return (
		<>
			{children}
		</>
	)

}

export function RedirectIfNotLoggedIn({ children }: { children: React.ReactNode }) {

	const context = useContext(AuthContext);
	const router = useRouter();

	useEffect(() => {
		if (!context.logged_in) {
			router.replace("/");
		}
	}, [context, router]);

	return (
		<>
			{children}
		</>
	)

}
