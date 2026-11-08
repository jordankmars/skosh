// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	Controlled,
	type ControlledProps,
	firePointer,
	setupFakeBrowser,
} from "./test-harness";

const browser = setupFakeBrowser();

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
	const handle = view.container.querySelector("[data-skosh-label]") as Element;
	const root = view.container.querySelector("[data-skosh-root]") as Element;
	return { ...view, handle, root, onValueChange, onValueCommit };
}

function drag(field: ReturnType<typeof setup>) {
	firePointer(field.handle, "pointerdown", { clientX: 100 });
	firePointer(field.handle, "pointermove", { clientX: 110 });
}

function lockedDrag(props?: ControlledProps) {
	const field = setup(props);
	drag(field);
	browser().grantLock();
	return field;
}

describe("asking for the lock", () => {
	it("asks once the drag moves", () => {
		const field = setup();
		firePointer(field.handle, "pointerdown", { clientX: 100 });
		expect(browser().pendingLocks).toHaveLength(0);
		firePointer(field.handle, "pointermove", { clientX: 110 });
		firePointer(field.handle, "pointermove", { clientX: 115 });
		expect(browser().pendingLocks).toEqual([field.handle]);
	});

	it("never asks for a click", () => {
		const field = setup();
		firePointer(field.handle, "pointerdown", { clientX: 100 });
		firePointer(field.handle, "pointerup", { clientX: 100 });
		expect(browser().pendingLocks).toHaveLength(0);
	});

	it("never asks on touch", () => {
		const field = setup();
		const touch = { pointerType: "touch" };
		firePointer(field.handle, "pointerdown", { ...touch, clientX: 100 });
		firePointer(field.handle, "pointermove", { ...touch, clientX: 120 });
		expect(browser().pendingLocks).toHaveLength(0);
	});

	it("never asks when turned off", () => {
		const field = setup({ pointerLock: false });
		drag(field);
		expect(browser().pendingLocks).toHaveLength(0);
	});

	it("keeps dragging if the browser refuses", () => {
		const field = setup();
		drag(field);
		browser().denyLock();
		firePointer(field.handle, "pointermove", { clientX: 115 });
		expect(field.onValueChange).toHaveBeenLastCalledWith(25);
	});
});

describe("while locked", () => {
	it("reads raw movement instead of the frozen position", () => {
		const field = lockedDrag();
		firePointer(field.handle, "pointermove", { clientX: 110, movementX: 7 });
		expect(field.onValueChange).toHaveBeenLastCalledWith(27);
	});

	it("skips the huge jump some browsers report after locking", () => {
		const field = lockedDrag();
		firePointer(field.handle, "pointermove", { movementX: 100000 });
		expect(field.onValueChange).toHaveBeenCalledTimes(1);
	});

	it("isn't ended by losing pointer capture", () => {
		const field = lockedDrag();
		firePointer(field.handle, "lostpointercapture");
		expect(field.root.hasAttribute("data-scrubbing")).toBe(true);
		expect(field.onValueCommit).not.toHaveBeenCalled();
	});

	it("lets go when the drag ends", () => {
		const field = lockedDrag();
		firePointer(field.handle, "pointerup");
		expect(browser().exitRequests).toBe(1);
		expect(field.onValueCommit.mock.calls).toEqual([[20]]);
	});

	it("ends the drag and commits if the lock is lost", () => {
		const field = lockedDrag();
		browser().exitLock();
		expect(field.root.hasAttribute("data-scrubbing")).toBe(false);
		expect(field.onValueCommit.mock.calls).toEqual([[20]]);
		firePointer(field.handle, "pointermove", { clientX: 200 });
		expect(field.onValueChange).toHaveBeenCalledTimes(1);
	});

	it("lets go when the field unmounts", () => {
		const field = lockedDrag();
		field.unmount();
		expect(browser().exitRequests).toBe(1);
	});
});

describe("timing", () => {
	it("gives back a lock that arrives after the drag is over", () => {
		const field = setup();
		drag(field);
		firePointer(field.handle, "pointerup");
		expect(browser().exitRequests).toBe(0);
		browser().grantLock();
		expect(browser().exitRequests).toBe(1);
		expect(field.onValueCommit).toHaveBeenCalledTimes(1);
	});

	it("doesn't let the last drag's exit end a new one", () => {
		const field = lockedDrag();
		firePointer(field.handle, "pointerup");
		firePointer(field.handle, "pointerdown", { clientX: 200 });
		firePointer(field.handle, "pointermove", { clientX: 210 });
		browser().exitLock();
		expect(field.root.hasAttribute("data-scrubbing")).toBe(true);
		firePointer(field.handle, "pointermove", { clientX: 215 });
		expect(field.onValueChange).toHaveBeenLastCalledWith(35);
	});

	it("asks again after that exit so the new drag gets the lock", () => {
		const field = lockedDrag();
		firePointer(field.handle, "pointerup");
		firePointer(field.handle, "pointerdown", { clientX: 200 });
		firePointer(field.handle, "pointermove", { clientX: 210 });
		browser().exitLock();
		expect(browser().pendingLocks).toEqual([field.handle]);
		browser().grantLock();
		firePointer(field.handle, "pointermove", { movementX: 2 });
		expect(field.onValueChange).toHaveBeenLastCalledWith(32);
	});

	it("ignores another element's lock", () => {
		const other = document.createElement("canvas");
		const field = setup();
		drag(field);
		browser().forceLock(other);
		browser().exitLock();
		expect(field.root.hasAttribute("data-scrubbing")).toBe(true);
		expect(field.onValueCommit).not.toHaveBeenCalled();
	});
});

describe("the cursor during a drag", () => {
	const overlay = () =>
		document.querySelector<HTMLElement>('[data-skosh-cursor="overlay"]');
	const drawn = () =>
		document.querySelector<HTMLElement>('[data-skosh-cursor="virtual"]');

	it("covers the page with the resize cursor for a mouse drag", () => {
		const field = setup({ pointerLock: false });
		expect(overlay()).toBeNull();
		drag(field);
		expect(overlay()?.style.cursor).toBe("ew-resize");
		firePointer(field.handle, "pointerup");
		expect(overlay()).toBeNull();
	});

	it("doesn't cover the page for a touch drag", () => {
		const field = setup();
		const touch = { pointerType: "touch" };
		firePointer(field.handle, "pointerdown", { ...touch, clientX: 100 });
		firePointer(field.handle, "pointermove", { ...touch, clientX: 120 });
		expect(overlay()).toBeNull();
	});

	it("draws a cursor where the pointer was once locked", () => {
		const field = setup();
		drag(field);
		expect(drawn()).toBeNull();
		browser().grantLock();
		expect(drawn()?.style.transform).toBe("translate(110px)");
		firePointer(field.handle, "pointerup");
		expect(drawn()).toBeNull();
	});

	it("wraps the drawn cursor around the window", () => {
		const field = lockedDrag();
		firePointer(field.handle, "pointermove", { movementX: -200 });
		expect(drawn()?.style.transform).toBe(
			`translate(${window.innerWidth - 90}px)`,
		);
	});

	it("doesn't draw one for another element's lock", () => {
		const field = setup();
		drag(field);
		browser().forceLock(document.createElement("canvas"));
		expect(drawn()).toBeNull();
	});

	it("removes everything if the field unmounts mid-drag", () => {
		const field = lockedDrag();
		field.unmount();
		expect(overlay()).toBeNull();
		expect(drawn()).toBeNull();
	});
});
