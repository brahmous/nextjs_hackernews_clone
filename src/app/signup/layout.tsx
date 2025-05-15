import { RedirectIfLoggedIn } from "@/client/auth_guard"

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<RedirectIfLoggedIn>
			<section>
				{children}
			</section>
		</RedirectIfLoggedIn>
	);
}
