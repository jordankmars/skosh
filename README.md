# skosh

[![CI](https://github.com/jordankmars/skosh/actions/workflows/ci.yml/badge.svg)](https://github.com/jordankmars/skosh/actions/workflows/ci.yml)

> A number field you change by dragging its label, like the inspector in a design tool.

It's for people building editors, design tools and creative apps:

```tsx
function Inspector() {
	const [width, setWidth] = useState(160);
	return (
		<Skosh label="W" value={width} onValueChange={setWidth} min={0} unit="px" />
	);
}
```

- Drag the label to scrub. Shift moves ×10 and Alt gives fine steps.
- Type a value, or a bit of math like `120*2`.
- Arrow keys step the value, with Shift for ×10.
- Keep dragging past the edge of the screen, using pointer lock where the browser allows it.
- Change modifiers mid-drag without the value jumping.
- Units, precision, and decimal commas in other languages.
- Works with touch: taps focus the field, horizontal drags scrub and vertical swipes still scroll.

## Status

The core and the React component are built, but nothing is published yet.

## Props

| Prop            | Type                      | Notes                                                                |
| --------------- | ------------------------- | -------------------------------------------------------------------- |
| `label`         | `ReactNode`               | The drag handle. If it's an icon, also pass `aria-label`.            |
| `value`         | `number`                  | Required. The field is always controlled.                            |
| `onValueChange` | `(value: number) => void` | Required. Called for every change, including each step of a drag.    |
| `onValueCommit` | `(value: number) => void` | Called once when a change is finished. Use this for undo history.    |
| `min`, `max`    | `number`                  | Limits for drags, arrow keys and typed values.                       |
| `step`          | `number`                  | Smallest change a drag or arrow key snaps to. Defaults to 1.         |
| `perPx`         | `number`                  | How much the value changes per pixel dragged. Defaults to `step`.    |
| `precision`     | `number`                  | Most decimal places the value can have.                              |
| `unit`          | `string`                  | Shown after the value, and allowed after a typed number.             |
| `locale`        | `string`                  | BCP 47 locale for the decimal separator. Defaults to the browser's.  |
| `disabled`      | `boolean`                 | Blocks everything.                                                   |
| `readOnly`      | `boolean`                 | Allows focus and selecting the text, but no changes.                 |
| `pointerLock`   | `boolean`                 | Set to `false` to stop drags at the window edge. Defaults to `true`. |

The ref, ARIA props, `id` and `name` go to the input. Everything else, like `className`, goes to the root.

## Styling

The component ships no CSS. It only sets the inline styles dragging needs, so the look is up to you. Each part has a data attribute to target:

| Part        | Selector             |
| ----------- | -------------------- |
| Root        | `[data-skosh-root]`  |
| Drag handle | `[data-skosh-label]` |
| Input       | `[data-skosh-input]` |
| Unit        | `[data-skosh-unit]`  |

The root also gets `data-scrubbing`, `data-editing`, `data-disabled` or `data-readonly` while each is true:

```css
[data-skosh-root][data-scrubbing] {
	background: #eee;
}
```

During a mouse drag, a full-window overlay and the drawn cursor are added to the page. They're marked `[data-skosh-cursor="overlay"]` and `[data-skosh-cursor="virtual"]`.

## Adapters

| Framework | Import path    | Status      |
| --------- | -------------- | ----------- |
| React     | `skosh/react`  | Unreleased  |
| Vue       | `skosh/vue`    | Coming soon |
| Svelte    | `skosh/svelte` | Coming soon |

## Development

```sh
pnpm install
pnpm playground   # a small inspector built from the React component
pnpm test
pnpm lint
pnpm typecheck
pnpm site:dev     # the docs site, builds the library first
```

The core lives in `src/core` and has no DOM code in it. It takes pointer deltas, key presses and typed text, and gives back values. Each adapter owns the event wiring, and `src/react` is the first one. The playground in `playground/main.tsx` imports the component straight from the source.

## Contributing

Bug reports and pull requests are welcome. For a new prop or a change in behavior, open an issue first so we can agree on the API. Run `pnpm lint`, `pnpm typecheck` and `pnpm test` before you push. CI runs the same checks.

## License

[MIT](./LICENSE)
