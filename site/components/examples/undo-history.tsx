"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-7 *:data-skosh-label:shrink-0 *:data-skosh-label:place-items-center *:data-skosh-label:text-[11px] *:data-skosh-label:text-neutral-500 dark:*:data-skosh-label:text-neutral-400",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:pr-2 *:data-skosh-input:font-mono *:data-skosh-input:text-xs *:data-skosh-input:tabular-nums *:data-skosh-input:outline-none",
].join(" ");

const button =
	"h-8 rounded-md bg-neutral-100 px-3 text-[13px] font-medium transition-colors hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:disabled:hover:bg-neutral-800";

export function UndoHistory() {
	const [width, setWidth] = useState(160);
	const [saved, setSaved] = useState(160);
	const [past, setPast] = useState<number[]>([]);
	const [future, setFuture] = useState<number[]>([]);
	const [changes, setChanges] = useState(0);

	const change = (value: number) => {
		setWidth(value);
		setChanges((n) => n + 1);
	};

	// One history entry per finished change, however many steps it took.
	const commit = (value: number) => {
		setPast([...past, saved]);
		setFuture([]);
		setSaved(value);
	};

	const restore = (value: number) => {
		setSaved(value);
		setWidth(value);
	};

	const undo = () => {
		setPast(past.slice(0, -1));
		setFuture([saved, ...future]);
		restore(past[past.length - 1]);
	};

	const redo = () => {
		setFuture(future.slice(1));
		setPast([...past, saved]);
		restore(future[0]);
	};

	return (
		<div className="grid w-64 gap-3">
			<Skosh
				label="W"
				aria-label="Width"
				min={0}
				value={width}
				onValueChange={change}
				onValueCommit={commit}
				className={field}
			/>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={undo}
					disabled={!past.length}
					className={button}
				>
					Undo
				</button>
				<button
					type="button"
					onClick={redo}
					disabled={!future.length}
					className={button}
				>
					Redo
				</button>
			</div>
			<p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
				{changes} changes, {past.length} in history
			</p>
		</div>
	);
}
