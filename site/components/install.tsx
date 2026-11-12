import { highlight } from "@/lib/highlight";
import { InstallTabs } from "./install-tabs";

const COMMANDS = [
	["pnpm", "pnpm add soupcon"],
	["npm", "npm install soupcon"],
	["yarn", "yarn add soupcon"],
	["bun", "bun add soupcon"],
] as const;

export async function Install() {
	const commands = await Promise.all(
		COMMANDS.map(async ([manager, code]) => ({
			manager,
			code,
			html: await highlight(code, "sh"),
		})),
	);
	return <InstallTabs commands={commands} />;
}
