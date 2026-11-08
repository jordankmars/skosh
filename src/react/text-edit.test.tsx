// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Skosh } from "./skosh";
import {
	Controlled,
	type ControlledProps,
	setupFakeBrowser,
} from "./test-harness";

setupFakeBrowser();

function setup(props: ControlledProps = {}) {
	const onValueChange = vi.fn();
	const onValueCommit = vi.fn();
	render(
		<Controlled
			onValueChange={onValueChange}
			onValueCommit={onValueCommit}
			{...props}
		/>,
	);
	const input = screen.getByRole<HTMLInputElement>("spinbutton");
	act(() => input.focus());
	return { input, onValueChange, onValueCommit };
}

const type = (input: HTMLInputElement, value: string) =>
	fireEvent.change(input, { target: { value } });
const press = (input: HTMLInputElement, key: string) =>
	fireEvent.keyDown(input, { key });

describe("typing", () => {
	it("commits on blur", () => {
		const { input, onValueChange, onValueCommit } = setup();
		type(input, "50");
		expect(onValueChange).not.toHaveBeenCalled();
		act(() => input.blur());
		expect(onValueChange.mock.calls).toEqual([[50]]);
		expect(onValueCommit.mock.calls).toEqual([[50]]);
		expect(input.value).toBe("50");
	});

	it("commits once on Enter and leaves the field", () => {
		const { input, onValueChange, onValueCommit } = setup();
		type(input, "50");
		press(input, "Enter");
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueCommit).toHaveBeenCalledTimes(1);
		expect(document.activeElement).not.toBe(input);
	});

	it("throws the text away on Escape", () => {
		const { input, onValueChange, onValueCommit } = setup();
		type(input, "50");
		press(input, "Escape");
		expect(onValueChange).not.toHaveBeenCalled();
		expect(onValueCommit).not.toHaveBeenCalled();
		expect(input.value).toBe("10");
		expect(document.activeElement).not.toBe(input);
	});

	it("evaluates math and accepts the unit", () => {
		const { input, onValueCommit } = setup({ unit: "px" });
		type(input, "120*2px");
		press(input, "Enter");
		expect(onValueCommit).toHaveBeenCalledWith(240);
	});

	it("reads the locale's decimal comma", () => {
		const { input, onValueCommit } = setup({ locale: "de-DE", step: 0.1 });
		type(input, "1,5");
		press(input, "Enter");
		expect(onValueCommit).toHaveBeenCalledWith(1.5);
	});

	it("keeps typed values inside the limits", () => {
		const { input, onValueCommit } = setup({ max: 100 });
		type(input, "500");
		press(input, "Enter");
		expect(onValueCommit).toHaveBeenCalledWith(100);
	});

	it("rounds typed values to the precision", () => {
		const { input, onValueCommit } = setup({ precision: 2 });
		type(input, "1.23456");
		press(input, "Enter");
		expect(onValueCommit).toHaveBeenCalledWith(1.23);
	});

	it("doesn't snap typed values to the step", () => {
		const { input, onValueCommit } = setup({ step: 5 });
		type(input, "12");
		press(input, "Enter");
		expect(onValueCommit).toHaveBeenCalledWith(12);
	});

	it("goes back to the value when the text makes no sense", () => {
		const { input, onValueChange } = setup();
		type(input, "abc");
		press(input, "Enter");
		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.value).toBe("10");
	});

	it("stays quiet when the typed value is the same", () => {
		const { input, onValueChange, onValueCommit } = setup();
		type(input, "5+5");
		press(input, "Enter");
		expect(onValueChange).not.toHaveBeenCalled();
		expect(onValueCommit).not.toHaveBeenCalled();
	});
});

describe("focus without typing", () => {
	it("leaves a value with extra decimals alone", () => {
		const { input, onValueChange } = setup({ initial: 1.23456, precision: 2 });
		expect(input.value).toBe("1.23");
		act(() => input.blur());
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("shows outside changes and doesn't overwrite them on blur", () => {
		const onValueChange = vi.fn();
		const { rerender } = render(
			<Skosh label="W" value={10} onValueChange={onValueChange} />,
		);
		const input = screen.getByRole<HTMLInputElement>("spinbutton");
		act(() => input.focus());
		rerender(<Skosh label="W" value={99} onValueChange={onValueChange} />);
		expect(input.value).toBe("99");
		act(() => input.blur());
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("marks the field as editing while focused", () => {
		const { input } = setup();
		const root = input.closest("[data-skosh-root]");
		expect(root?.hasAttribute("data-editing")).toBe(true);
		act(() => input.blur());
		expect(root?.hasAttribute("data-editing")).toBe(false);
	});
});

describe("becoming disabled while focused", () => {
	it("stops marking the field as editing", () => {
		const { container, rerender } = render(
			<Skosh label="W" value={10} onValueChange={() => {}} />,
		);
		const input = screen.getByRole<HTMLInputElement>("spinbutton");
		act(() => input.focus());
		const root = container.querySelector("[data-skosh-root]");
		expect(root?.hasAttribute("data-editing")).toBe(true);
		rerender(<Skosh label="W" value={10} onValueChange={() => {}} disabled />);
		expect(root?.hasAttribute("data-editing")).toBe(false);
	});
});

describe("becoming read-only while typing", () => {
	it("drops the text without committing", () => {
		const onValueChange = vi.fn();
		const { rerender } = render(
			<Skosh label="W" value={10} onValueChange={onValueChange} />,
		);
		const input = screen.getByRole<HTMLInputElement>("spinbutton");
		act(() => input.focus());
		type(input, "50");
		rerender(
			<Skosh label="W" value={10} onValueChange={onValueChange} readOnly />,
		);
		expect(input.value).toBe("10");
		act(() => input.blur());
		expect(onValueChange).not.toHaveBeenCalled();
	});
});
