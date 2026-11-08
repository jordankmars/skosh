import {
	type ChangeEvent,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { editKeyAction } from "../core";

export interface TextEditOptions {
	value: number;
	format: (value: number) => string;
	/** Reads typed text into a value the field can hold, or null if it can't. */
	parse: (text: string) => number | null;
	onChange: (value: number) => void;
	onCommit?: (value: number) => void;
	editable: boolean;
}

/**
 * Handles typing into the input. There is no draft until someone actually
 * types, so a value changed from outside still shows while the field has
 * focus, and tabbing through never rewrites a value.
 */
export function useTextEdit(options: TextEditOptions) {
	const { value, format, parse, onChange, onCommit, editable } = options;
	const [draft, setDraftState] = useState<string | null>(null);
	const [focused, setFocused] = useState(false);
	// Blurring from a key handler runs onBlur before React re-renders, so the
	// handlers need the current draft and not the one from the last render.
	const draftRef = useRef<string | null>(null);

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

	useEffect(() => {
		if (editable) return;
		draftRef.current = null;
		setDraftState(null);
	}, [editable]);

	const inputProps = {
		value: draft ?? format(value),
		onChange: (e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
		onFocus: () => setFocused(true),
		onBlur: () => {
			commitDraft();
			setFocused(false);
		},
		onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
			const action = editKeyAction(e.key);
			if (action === "commit") commitDraft();
			if (action === "revert") setDraft(null);
			if (action) e.currentTarget.blur();
		},
	};

	return { inputProps, focused, commitDraft };
}
