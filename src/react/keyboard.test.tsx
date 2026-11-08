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
	const view = render(
		<Controlled
			onValueChange={onValueChange}
			onValueCommit={onValueCommit}
			{...props}
		/>,
	);
	const input = screen.getByRole<HTMLInputElement>("spinbutton");
	act(() => input.focus());
	return { ...view, input, onValueChange, onValueCommit };
}

const down = (el: HTMLElement, key: string, init = {}) =>
	fireEvent.keyDown(el, { key, ...init });
const up = (el: HTMLElement, key: string) => fireEvent.keyUp(el, { key });

describe("arrow keys", () => {
	it("steps, with Shift for x10 and Alt for fine steps", () => {
		const { input, onValueChange } = setup();
		down(input, "ArrowUp");
		down(input, "ArrowUp", { shiftKey: true });
		down(input, "ArrowDown", { altKey: true });
		expect(onValueChange.mock.calls).toEqual([[11], [21], [20.9]]);
		expect(input.value).toBe("20.9");
	});

	it("commits once when the key comes up, however long it was held", () => {
		const { input, onValueChange, onValueCommit } = setup();
		down(input, "ArrowUp");
		down(input, "ArrowUp", { repeat: true });
		down(input, "ArrowUp", { repeat: true });
		expect(onValueChange).toHaveBeenCalledTimes(3);
		expect(onValueCommit).not.toHaveBeenCalled();
		up(input, "ArrowUp");
		expect(onValueCommit.mock.calls).toEqual([[13]]);
	});

	it("commits on blur if the key never came up", () => {
		const { input, onValueCommit } = setup();
		down(input, "ArrowUp");
		act(() => input.blur());
		expect(onValueCommit.mock.calls).toEqual([[11]]);
	});

	it("commits on unmount if the key never came up", () => {
		const { input, onValueCommit, unmount } = setup();
		down(input, "ArrowUp");
		unmount();
		expect(onValueCommit.mock.calls).toEqual([[11]]);
	});

	it("stays quiet at the limit", () => {
		const { input, onValueChange, onValueCommit } = setup({
			initial: 100,
			max: 100,
		});
		down(input, "ArrowUp");
		up(input, "ArrowUp");
		expect(onValueChange).not.toHaveBeenCalled();
		expect(onValueCommit).not.toHaveBeenCalled();
	});

	it("doesn't commit when up and down cancel out", () => {
		const { input, onValueCommit } = setup();
		down(input, "ArrowUp");
		down(input, "ArrowDown");
		up(input, "ArrowDown");
		expect(onValueCommit).not.toHaveBeenCalled();
	});

	it("steps from the typed text rather than throwing it away", () => {
		const { input, onValueChange, onValueCommit } = setup();
		fireEvent.change(input, { target: { value: "50" } });
		down(input, "ArrowUp");
		up(input, "ArrowUp");
		expect(onValueChange.mock.calls).toEqual([[51]]);
		expect(onValueCommit.mock.calls).toEqual([[51]]);
		expect(input.value).toBe("51");
	});

	it("shows the host's value when it rejects a step", () => {
		render(<Skosh label="W" value={10} onValueChange={() => {}} />);
		const input = screen.getByRole<HTMLInputElement>("spinbutton");
		down(input, "ArrowUp");
		expect(input.value).toBe("10");
	});

	it("does nothing when read-only", () => {
		const { input, onValueChange } = setup({ readOnly: true });
		down(input, "ArrowUp");
		expect(onValueChange).not.toHaveBeenCalled();
	});
});
