"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-soupcon-label:grid *:data-soupcon-label:h-full *:data-soupcon-label:w-7 *:data-soupcon-label:shrink-0 *:data-soupcon-label:place-items-center *:data-soupcon-label:text-[11px] *:data-soupcon-label:text-neutral-500 dark:*:data-soupcon-label:text-neutral-400",
	"*:data-soupcon-input:w-full *:data-soupcon-input:min-w-0 *:data-soupcon-input:pr-2 *:data-soupcon-input:font-mono *:data-soupcon-input:text-xs *:data-soupcon-input:tabular-nums *:data-soupcon-input:outline-none",
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
			<Soupcon
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
