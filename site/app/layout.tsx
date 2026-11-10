import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: { default: "Skosh", template: "%s · Skosh" },
	description: "A number field you change by dragging its label.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${jetbrainsMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex min-h-dvh flex-col bg-white font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
