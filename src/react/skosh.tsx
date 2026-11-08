import {
	type CSSProperties,
	forwardRef,
	type HTMLAttributes,
	type ReactNode,
	useImperativeHandle,
	useRef,
} from "react";
import { clamp, formatValue, parseValue, roundToStep } from "../core";
import { ScrubCursor } from "./scrub-cursor";
import { useResolvedLocale } from "./use-locale";
import { useScrub } from "./use-scrub";
import { useTextEdit } from "./use-text-edit";

type RootAttributes = Omit<
	HTMLAttributes<HTMLLabelElement>,
	"children" | "defaultValue" | "onChange"
>;

export interface SkoshProps extends RootAttributes {
	/** Shown as the drag handle. If it's an icon, also pass `aria-label`. */
	label: ReactNode;
	value: number;
	/** Called with every change, including each step of a drag. */
	onValueChange: (value: number) => void;
	/** Called once when a change is finished, like the end of a drag. Good for undo history. */
	onValueCommit?: (value: number) => void;
	min?: number;
	max?: number;
	/** Smallest change a drag or arrow key snaps to. Defaults to 1. */
	step?: number;
	/** How much the value changes per pixel dragged. Defaults to `step`. */
	perPx?: number;
	/** Most decimal places the value can have. */
	precision?: number;
	/** Shown after the value, and allowed after a typed number. */
	unit?: string;
	/** BCP 47 locale for the decimal separator. Defaults to the browser's. */
	locale?: string;
	disabled?: boolean;
	readOnly?: boolean;
	/** Keep dragging past the edge of the screen where the browser allows it. Defaults to true. */
	pointerLock?: boolean;
	id?: string;
	name?: string;
}

const flag = (on: boolean | undefined) => (on ? "" : undefined);

/** Pulls out what belongs on the input: ARIA props, plus `id` and `name`. */
function splitProps(rest: Record<string, unknown>) {
	const input: Record<string, unknown> = {};
	const root: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(rest)) {
		const target =
			key.startsWith("aria-") || key === "id" || key === "name" ? input : root;
		target[key] = value;
	}
	return { input, root };
}

/** A number field you change by dragging its label. */
export const Skosh = forwardRef<HTMLInputElement, SkoshProps>(function Skosh(
	{
		label,
		value,
		onValueChange,
		onValueCommit,
		min,
		max,
		step,
		perPx,
		precision,
		unit,
		locale,
		disabled,
		readOnly,
		pointerLock = true,
		...rest
	},
	ref,
) {
	const inputRef = useRef<HTMLInputElement>(null);
	useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

	const resolvedLocale = useResolvedLocale(locale);
	const format = (v: number) =>
		formatValue(v, { step, precision, locale: resolvedLocale });
	const text = format(value);
	const { input: inputProps, root: rootProps } = splitProps(rest);
	const interactive = !disabled && !readOnly;
	const scrubOptions = { min, max, step, precision, perPx };

	// Typed values can land between steps, but never past the limits.
	const parse = (typed: string) => {
		const n = parseValue(typed, { unit, locale: resolvedLocale });
		if (n === null) return null;
		const rounded =
			precision === undefined ? n : roundToStep(n, 10 ** -precision);
		return clamp(rounded, min ?? -Infinity, max ?? Infinity);
	};

	const edit = useTextEdit({
		value,
		format,
		parse,
		onChange: onValueChange,
		onCommit: onValueCommit,
		editable: interactive,
		scrubOptions,
	});

	const scrub = useScrub({
		value,
		scrubOptions,
		onChange: onValueChange,
		onCommit: onValueCommit,
		enabled: interactive,
		pointerLock,
		commitDraft: edit.commitDraft,
		onTap: () => {
			inputRef.current?.focus();
			inputRef.current?.select();
		},
	});

	const labelStyle: CSSProperties = {
		userSelect: "none",
		WebkitUserSelect: "none",
		...(interactive && { cursor: "ew-resize", touchAction: "pan-y" }),
	};

	return (
		<>
			<label
				{...rootProps}
				data-skosh-root=""
				data-disabled={flag(disabled)}
				data-readonly={flag(readOnly)}
				data-editing={flag(edit.focused)}
				data-scrubbing={flag(scrub.scrubbing)}
			>
				{/* A pointer-only handle. Keyboard users step with the arrow keys in the input. */}
				<span data-skosh-label="" style={labelStyle} {...scrub.handleProps}>
					{label}
				</span>
				<input
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={value}
					aria-valuetext={unit ? `${text} ${unit}` : text}
					{...inputProps}
					{...edit.inputProps}
					ref={inputRef}
					data-skosh-input=""
					type="text"
					inputMode="decimal"
					role="spinbutton"
					autoComplete="off"
					disabled={disabled}
					readOnly={readOnly}
				/>
				{unit ? (
					<span data-skosh-unit="" aria-hidden="true">
						{unit}
					</span>
				) : null}
			</label>
			{scrub.cursorTarget ? (
				<ScrubCursor
					target={scrub.cursorTarget}
					locked={scrub.locked}
					cursorRef={scrub.cursorRef}
				/>
			) : null}
		</>
	);
});
