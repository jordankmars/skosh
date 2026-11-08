import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * With no locale given, the server and the browser could format the same
 * number differently and break hydration. So the first pass uses a fixed
 * locale, and the browser's own takes over right after.
 */
export function useResolvedLocale(locale?: string): string | undefined {
	const hydrated = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
	return locale ?? (hydrated ? undefined : "en-US");
}
