import { RedirectIfLoggedIn } from "@/client/auth-guard"

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<RedirectIfLoggedIn>
			<section>
				{children}
			</section>
		</RedirectIfLoggedIn>
	);
}
