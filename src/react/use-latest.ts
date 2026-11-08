import { useEffect, useLayoutEffect, useRef } from "react";

// React 18 warns about useLayoutEffect during server rendering.
export const useIsomorphicLayoutEffect =
	typeof document === "undefined" ? useEffect : useLayoutEffect;

/** A ref that always holds the newest value, for listeners that outlive a render. */
export function useLatest<T>(value: T) {
	const ref = useRef(value);
	useIsomorphicLayoutEffect(() => {
		ref.current = value;
	});
	return ref;
}
