/** A row of radio buttons pinned to the corner of a demo. */
export function Options<T extends string | number>({
	legend,
	values,
	value,
	onChange,
}: {
	legend: string;
	values: readonly T[];
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<fieldset className="absolute bottom-4 left-4 flex w-fit gap-1">
			<legend className="sr-only">{legend}</legend>
			{values.map((option) => (
				<label key={option} className="block cursor-pointer">
					<input
						type="radio"
						name={legend}
						value={option}
						checked={value === option}
						onChange={() => onChange(option)}
						className="peer sr-only"
					/>
					<span className="block rounded border border-neutral-300 px-2 py-0.5 font-mono text-xs peer-checked:border-neutral-900 peer-checked:bg-neutral-900 peer-checked:text-neutral-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-neutral-400 dark:border-neutral-700 dark:peer-checked:border-neutral-100 dark:peer-checked:bg-neutral-100 dark:peer-checked:text-neutral-900">
						{option}
					</span>
				</label>
			))}
		</fieldset>
	);
}
