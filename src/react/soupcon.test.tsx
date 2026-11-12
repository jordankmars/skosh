// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Soupcon } from "./soupcon";
import { setupFakeBrowser } from "./test-harness";

setupFakeBrowser();

const noop = () => {};

describe("rendering", () => {
	it("names the input after its label and shows the value", () => {
		render(<Soupcon label="W" value={160} onValueChange={noop} />);
		const input = screen.getByRole("spinbutton", { name: "W" });
		expect(input).toHaveProperty("value", "160");
		expect(input.getAttribute("aria-valuenow")).toBe("160");
	});

	it("includes the unit in the spoken value but not the name", () => {
		render(<Soupcon label="W" value={160} unit="px" onValueChange={noop} />);
		const input = screen.getByRole("spinbutton", { name: "W" });
		expect(input.getAttribute("aria-valuetext")).toBe("160 px");
		expect(
			input.parentElement
				?.querySelector("[data-soupcon-unit]")
				?.getAttribute("aria-hidden"),
		).toBe("true");
	});

	it("puts ARIA props, id and name on the input and the rest on the root", () => {
		const { container } = render(
			<Soupcon
				label={<svg />}
				value={1}
				onValueChange={noop}
				aria-label="Width"
				id="w"
				name="width"
				className="mine"
				data-test="x"
			/>,
		);
		const input = screen.getByRole("spinbutton", { name: "Width" });
		expect(input.id).toBe("w");
		expect(input.getAttribute("name")).toBe("width");
		const root = container.querySelector("[data-soupcon-root]");
		expect(root?.className).toBe("mine");
		expect(root?.getAttribute("data-test")).toBe("x");
	});

	it("forwards the ref to the input", () => {
		const ref = createRef<HTMLInputElement>();
		render(<Soupcon ref={ref} label="W" value={1} onValueChange={noop} />);
		expect(ref.current?.tagName).toBe("INPUT");
	});

	it("marks disabled and read-only fields", () => {
		const { container, rerender } = render(
			<Soupcon label="W" value={1} onValueChange={noop} disabled />,
		);
		const root = container.querySelector("[data-soupcon-root]");
		expect(root?.hasAttribute("data-disabled")).toBe(true);
		expect(screen.getByRole("spinbutton")).toHaveProperty("disabled", true);
		rerender(<Soupcon label="W" value={1} onValueChange={noop} readOnly />);
		expect(root?.hasAttribute("data-disabled")).toBe(false);
		expect(root?.hasAttribute("data-readonly")).toBe(true);
		expect(screen.getByRole("spinbutton")).toHaveProperty("readOnly", true);
	});

	it("only makes the label draggable when the field can change", () => {
		const { container, rerender } = render(
			<Soupcon label="W" value={1} onValueChange={noop} />,
		);
		const handle = container.querySelector<HTMLElement>("[data-soupcon-label]");
		expect(handle?.style.cursor).toBe("ew-resize");
		rerender(<Soupcon label="W" value={1} onValueChange={noop} disabled />);
		expect(handle?.style.cursor).toBe("");
	});

	it("formats with the given locale", () => {
		render(
			<Soupcon
				label="W"
				value={1.5}
				step={0.1}
				locale="de-DE"
				onValueChange={noop}
			/>,
		);
		expect(screen.getByRole("spinbutton")).toHaveProperty("value", "1,5");
	});

	it("uses a fixed locale for server output", () => {
		const html = renderToString(
			<Soupcon label="W" value={1.5} step={0.1} onValueChange={vi.fn()} />,
		);
		expect(html).toContain('value="1.5"');
	});
});
