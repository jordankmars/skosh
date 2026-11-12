// @vitest-environment jsdom
import { act, screen } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Soupcon } from "./soupcon";
import { setupFakeBrowser } from "./test-harness";

setupFakeBrowser();

afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

/** Makes the runtime's default locale German, as a visitor's browser might be. */
function useGermanRuntime() {
	class GermanByDefault extends Intl.NumberFormat {
		constructor(
			locale?: Intl.LocalesArgument,
			options?: Intl.NumberFormatOptions,
		) {
			super(locale ?? "de-DE", options);
		}
	}
	vi.spyOn(Intl, "NumberFormat").mockImplementation(
		GermanByDefault as unknown as typeof Intl.NumberFormat,
	);
}

describe("hydrating server output", () => {
	it("matches the server, then switches to the browser's locale", () => {
		const element = (
			<Soupcon label="W" value={1.5} step={0.1} onValueChange={() => {}} />
		);
		const server = renderToString(element);
		expect(server).toContain('value="1.5"');

		const container = document.createElement("div");
		container.innerHTML = server;
		document.body.append(container);
		useGermanRuntime();

		const consoleError = vi.spyOn(console, "error");

		const recoverable = vi.fn();
		let root: Root | undefined;
		act(() => {
			root = hydrateRoot(container, element, {
				onRecoverableError: recoverable,
			});
		});

		expect(recoverable).not.toHaveBeenCalled();
		expect(consoleError).not.toHaveBeenCalled();
		expect(screen.getByRole("spinbutton")).toHaveProperty("value", "1,5");
		act(() => root?.unmount());
	});
});
