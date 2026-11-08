// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	Controlled,
	type ControlledProps,
	firePointer,
	setupFakeBrowser,
} from "./test-harness";

setupFakeBrowser();

function setup(props: ControlledProps = {}) {
	const onValueChange = vi.fn();
	const onValueCommit = vi.fn();
	const shared = { onValueChange, onValueCommit, pointerLock: false };
	const view = render(<Controlled {...shared} {...props} />);
	const input = screen.getByRole<HTMLInputElement>("spinbutton");
	const handle = view.container.querySelector("[data-skosh-label]") as Element;
	const root = view.container.querySelector("[data-skosh-root]") as Element;
	const rerender = (next: ControlledProps) =>
		view.rerender(<Controlled {...shared} {...props} {...next} />);
	return {
		...view,
		rerender,
		input,
		handle,
		root,
		onValueChange,
		onValueCommit,
	};
}

describe("dragging with a mouse", () => {
	it("changes the value as it moves and commits once at the end", () => {
		const { handle, input, onValueChange, onValueCommit } = setup();
		firePointer(handle, "pointerdown", { clientX: 100 });
		firePointer(handle, "pointermove", { clientX: 110 });
		firePointer(handle, "pointermove", { clientX: 115 });
		expect(onValueChange.mock.calls).toEqual([[20], [25]]);
		expect(onValueCommit).not.toHaveBeenCalled();
		firePointer(handle, "pointerup", { clientX: 115 });
		expect(onValueCommit.mock.calls).toEqual([[25]]);
		expect(input.value).toBe("25");
	});

	it("marks the field while it's being dragged", () => {
		const { handle, root } = setup();
		firePointer(handle, "pointerdown", { clientX: 100 });
		expect(root.hasAttribute("data-scrubbing")).toBe(false);
		firePointer(handle, "pointermove", { clientX: 110 });
		expect(root.hasAttribute("data-scrubbing")).toBe(true);
		firePointer(handle, "pointerup");
		expect(root.hasAttribute("data-scrubbing")).toBe(false);
	});

	it("keeps going without a jump when Shift changes mid-drag", () => {
		const { handle, onValueChange } = setup();
		firePointer(handle, "pointerdown", { clientX: 100 });
		firePointer(handle, "pointermove", { clientX: 105 });
		firePointer(handle, "pointermove", { clientX: 106, shiftKey: true });
		firePointer(handle, "pointermove", { clientX: 107 });
		expect(onValueChange.mock.calls).toEqual([[15], [25], [26]]);
	});

	it("doesn't round the value when only moving vertically", () => {
		const { handle, onValueChange } = setup({ initial: 10.37 });
		firePointer(handle, "pointerdown", { clientX: 100, clientY: 100 });
		firePointer(handle, "pointermove", { clientX: 100, clientY: 150 });
		firePointer(handle, "pointerup", { clientX: 100, clientY: 150 });
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("doesn't commit when the drag ends where it started", () => {
		const { handle, onValueCommit } = setup();
		firePointer(handle, "pointerdown", { clientX: 100 });
		firePointer(handle, "pointermove", { clientX: 110 });
		firePointer(handle, "pointermove", { clientX: 100 });
		firePointer(handle, "pointerup");
		expect(onValueCommit).not.toHaveBeenCalled();
	});

	it("ignores other mouse buttons", () => {
		const { handle, onValueChange } = setup();
		firePointer(handle, "pointerdown", { clientX: 100, button: 2 });
		firePointer(handle, "pointermove", { clientX: 110 });
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("does nothing when read-only or disabled", () => {
		for (const props of [{ readOnly: true }, { disabled: true }]) {
			const { handle, onValueChange, unmount } = setup(props);
			firePointer(handle, "pointerdown", { clientX: 100 });
			firePointer(handle, "pointermove", { clientX: 110 });
			expect(onValueChange).not.toHaveBeenCalled();
			unmount();
		}
	});

	it("works under StrictMode", () => {
		const onValueCommit = vi.fn();
		const { container } = render(
			<StrictMode>
				<Controlled pointerLock={false} onValueCommit={onValueCommit} />
			</StrictMode>,
		);
		const handle = container.querySelector("[data-skosh-label]") as Element;
		firePointer(handle, "pointerdown", { clientX: 100 });
		firePointer(handle, "pointermove", { clientX: 110 });
		firePointer(handle, "pointerup", { clientX: 110 });
		expect(onValueCommit.mock.calls).toEqual([[20]]);
	});
});

describe("tapping the label", () => {
	it("focuses and selects the input without changing anything", () => {
		const { handle, input, onValueChange } = setup();
		firePointer(handle, "pointerdown", { clientX: 100 });
		firePointer(handle, "pointermove", { clientX: 101 });
		firePointer(handle, "pointerup", { clientX: 101 });
		expect(document.activeElement).toBe(input);
		expect(input.selectionStart).toBe(0);
		expect(input.selectionEnd).toBe(input.value.length);
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("doesn't take focus at the end of a drag", () => {
		const { handle, input } = setup();
		firePointer(handle, "pointerdown", { clientX: 100 });
		firePointer(handle, "pointermove", { clientX: 110 });
		firePointer(handle, "pointerup", { clientX: 110 });
		expect(document.activeElement).not.toBe(input);
	});
});

describe("touch", () => {
	const touch = { pointerType: "touch" };

	it("scrubs on a horizontal drag", () => {
		const { handle, onValueChange } = setup();
		firePointer(handle, "pointerdown", { ...touch, clientX: 100 });
		firePointer(handle, "pointermove", { ...touch, clientX: 120 });
		expect(onValueChange.mock.calls).toEqual([[30]]);
	});

	it("leaves a vertical swipe to the page", () => {
		const { handle, onValueChange, onValueCommit } = setup();
		firePointer(handle, "pointerdown", {
			...touch,
			clientX: 100,
			clientY: 100,
		});
		firePointer(handle, "pointermove", {
			...touch,
			clientX: 100,
			clientY: 130,
		});
		firePointer(handle, "pointermove", {
			...touch,
			clientX: 150,
			clientY: 130,
		});
		firePointer(handle, "pointercancel", touch);
		expect(onValueChange).not.toHaveBeenCalled();
		expect(onValueCommit).not.toHaveBeenCalled();
	});

	it("ignores a second finger", () => {
		const { handle, onValueChange } = setup();
		firePointer(handle, "pointerdown", {
			...touch,
			pointerId: 1,
			clientX: 100,
		});
		firePointer(handle, "pointermove", {
			...touch,
			pointerId: 1,
			clientX: 120,
		});
		firePointer(handle, "pointerdown", {
			...touch,
			pointerId: 2,
			clientX: 300,
		});
		firePointer(handle, "pointermove", {
			...touch,
			pointerId: 2,
			clientX: 400,
		});
		firePointer(handle, "pointerup", { ...touch, pointerId: 2, clientX: 400 });
		firePointer(handle, "pointermove", {
			...touch,
			pointerId: 1,
			clientX: 125,
		});
		expect(onValueChange.mock.calls).toEqual([[30], [35]]);
	});
});

describe("ending a drag early", () => {
	const dragged = (props: ControlledProps = {}) => {
		const field = setup(props);
		firePointer(field.handle, "pointerdown", { clientX: 100 });
		firePointer(field.handle, "pointermove", { clientX: 110 });
		return field;
	};

	it("commits on pointercancel", () => {
		const { handle, onValueCommit } = dragged();
		firePointer(handle, "pointercancel");
		expect(onValueCommit.mock.calls).toEqual([[20]]);
	});

	it("commits when capture is lost, but only once", () => {
		const { handle, onValueCommit } = dragged();
		firePointer(handle, "lostpointercapture");
		firePointer(handle, "pointerup", { clientX: 110 });
		expect(onValueCommit.mock.calls).toEqual([[20]]);
	});

	it("commits and stops when the field becomes disabled", () => {
		const { handle, rerender, onValueChange, onValueCommit } = dragged();
		rerender({ disabled: true });
		expect(onValueCommit.mock.calls).toEqual([[20]]);
		firePointer(handle, "pointermove", { clientX: 200 });
		expect(onValueChange).toHaveBeenCalledTimes(1);
	});

	it("commits when the field unmounts", () => {
		const { unmount, onValueCommit } = dragged();
		unmount();
		expect(onValueCommit.mock.calls).toEqual([[20]]);
	});
});

describe("dragging with typed text pending", () => {
	it("applies the text first and drags from it", () => {
		const { handle, input, onValueChange, onValueCommit } = setup();
		act(() => input.focus());
		fireEvent.change(input, { target: { value: "50" } });
		firePointer(handle, "pointerdown", { clientX: 100 });
		firePointer(handle, "pointermove", { clientX: 105 });
		expect(onValueChange.mock.calls).toEqual([[50], [55]]);
		expect(onValueCommit.mock.calls).toEqual([[50]]);
		expect(input.value).toBe("55");
	});

	it("keeps the text if the press turns out to be a tap", () => {
		const { handle, input, onValueChange } = setup();
		act(() => input.focus());
		fireEvent.change(input, { target: { value: "50" } });
		firePointer(handle, "pointerdown", { clientX: 100 });
		firePointer(handle, "pointerup", { clientX: 100 });
		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.value).toBe("50");
	});
});
