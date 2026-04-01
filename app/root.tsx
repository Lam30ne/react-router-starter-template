import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const is404 = isRouteErrorResponse(error) && error.status === 404;

	return (
		<main
			className="fixed inset-0 flex flex-col items-center justify-center"
			style={{ background: "#0f0a05" }}
		>
			<div className="text-center max-w-md px-6">
				<div className="text-amber-200/30 text-6xl mb-6 font-extralight">
					~
				</div>
				<h1 className="text-amber-100/50 text-xl font-extralight tracking-wider mb-4">
					{is404
						? "This space doesn't exist yet"
						: "Something needs a moment"}
				</h1>
				<p className="text-amber-200/25 text-sm font-light leading-relaxed mb-8">
					{is404
						? "Let's bring you back to a calmer place."
						: "Take a breath. These things happen. Let's start fresh."}
				</p>
				<a
					href="/"
					className="inline-block px-6 py-3 rounded-full bg-amber-200/8 text-amber-100/40 text-sm font-light tracking-wider border border-amber-200/12 hover:bg-amber-200/12 transition-all duration-500"
				>
					Return home
				</a>
			</div>
		</main>
	);
}
