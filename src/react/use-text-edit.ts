import {
	type ChangeEvent,
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	editKeyAction,
	type ScrubOptions,
	stepFromKey,
	stepValue,
} from "../core";
import { createGesture, type ValueGesture } from "./gesture";
import { useLatest } from "./use-latest";

export interface TextEditOptions {
	value: number;
	format: (value: number) => string;
	/** Reads typed text into a value the field can hold, or null if it can't. */
	parse: (text: string) => number | null;
	onChange: (value: number) => void;
	onCommit?: (value: number) => void;
	editable: boolean;
	scrubOptions: ScrubOptions;
}

/**
 * Handles typing into the input. There is no draft until someone actually
 * types, so a value changed from outside still shows while the field has
 * focus, and tabbing through never rewrites a value.
 */
export function useTextEdit(options: TextEditOptions) {
	const { value, format, parse, onChange, onCommit, editable, scrubOptions } =
		options;
	const [draft, setDraftState] = useState<string | null>(null);
	const [focused, setFocused] = useState(false);
	// Blurring from a key handler runs onBlur before React re-renders, so the
	// handlers need the current draft and not the one from the last render.
	const draftRef = useRef<string | null>(null);
	const keyGesture = useRef<ValueGesture | null>(null);
	const latestCommit = useLatest(onCommit);

	const setDraft = (text: string | null) => {
		draftRef.current = text;
		setDraftState(text);
	};

	/** Applies any typed text, and returns the new value if that changed it. */
	const commitDraft = (): number | null => {
		const text = draftRef.current;
		if (text === null) return null;
		setDraft(null);
		if (text === format(value)) return null;
		const next = parse(text);
		if (next === null || next === value) return null;
		onChange(next);
		onCommit?.(next);
		return next;
	};

	const finishKeys = useCallback(() => {
		const final = keyGesture.current?.finish() ?? null;
		keyGesture.current = null;
		if (final !== null) latestCommit.current?.(final);
	}, [latestCommit]);

	useEffect(() => {
		if (editable) return;
		draftRef.current = null;
		setDraftState(null);
		finishKeys();
	}, [editable, finishKeys]);

	useEffect(() => finishKeys, [finishKeys]);

	/** Moves the value for an arrow key. Returns false for any other key. */
	const stepFromArrow = (e: KeyboardEvent<HTMLInputElement>): boolean => {
		if (!editable) return false;
		const typed = draftRef.current === null ? null : parse(draftRef.current);
		const mods = { shift: e.shiftKey, alt: e.altKey };
		const next = stepValue(typed ?? value, e.key, mods, scrubOptions);
		if (next === null) return false;
		e.preventDefault();
		setDraft(null);
		keyGesture.current ??= createGesture(value);
		keyGesture.current.update(next);
		if (next !== value) onChange(next);
		return true;
	};

	const inputProps = {
		value: draft ?? format(value),
		onChange: (e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
		onFocus: () => setFocused(true),
		onBlur: () => {
			commitDraft();
			finishKeys();
			setFocused(false);
		},
		onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
			if (stepFromArrow(e)) return;
			const action = editKeyAction(e.key);
			if (action === "commit") commitDraft();
			if (action === "revert") setDraft(null);
			if (action) e.currentTarget.blur();
		},
		onKeyUp: (e: KeyboardEvent<HTMLInputElement>) => {
			if (stepFromKey(e.key) !== null) finishKeys();
		},
	};

	return { inputProps, focused, commitDraft };
}
