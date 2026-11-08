# skosh

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

The framework-free core is in place. The React component above is next, so nothing is published yet.

## Adapters

| Framework | Import path    | Status      |
| --------- | -------------- | ----------- |
| React     | `skosh/react`  | In progress |
| Vue       | `skosh/vue`    | Coming soon |
| Svelte    | `skosh/svelte` | Coming soon |

## Development

```sh
pnpm install
pnpm playground   # one-page React app that wires the core up by hand
pnpm test         # unit tests for the core
pnpm lint
pnpm typecheck
```

The core lives in `src/core` and has no DOM code in it. It takes pointer deltas, key presses and typed text, and gives back values. Each adapter owns the event wiring. The playground in `playground/main.tsx` does the same wiring by hand, so you can try changes to the core without going through a component.

## Contributing

Contributions are welcome. Please open an issue to discuss changes before submitting a pull request.

## License

[MIT](./LICENSE)
