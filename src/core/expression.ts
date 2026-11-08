/**
 * Evaluates a small arithmetic expression like `120*2` or `(10 + 5) / 3`.
 *
 * Supports + - * /, parentheses, unary signs and decimals. Anything else,
 * including division by zero, gives null. It's a recursive descent parser
 * rather than eval, so typed input can never run code.
 */
export function evaluate(text: string): number | null {
	let pos = 0;

	const skipSpace = () => {
		while (text[pos] === " " || text[pos] === "\t") pos++;
	};

	const peek = () => {
		skipSpace();
		return text[pos];
	};

	// expression = term (("+" | "-") term)*
	const expression = (): number => {
		let value = term();
		for (let op = peek(); op === "+" || op === "-"; op = peek()) {
			pos++;
			const right = term();
			value = op === "+" ? value + right : value - right;
		}
		return value;
	};

	// term = unary (("*" | "/") unary)*
	const term = (): number => {
		let value = unary();
		for (let op = peek(); op === "*" || op === "/"; op = peek()) {
			pos++;
			const right = unary();
			value = op === "*" ? value * right : value / right;
		}
		return value;
	};

	// unary = ("+" | "-") unary | primary
	const unary = (): number => {
		const op = peek();
		if (op === "+" || op === "-") {
			pos++;
			const value = unary();
			return op === "-" ? -value : value;
		}
		return primary();
	};

	// primary = number | "(" expression ")"
	const primary = (): number => {
		if (peek() === "(") {
			pos++;
			const value = expression();
			if (peek() !== ")") throw new SyntaxError("Missing )");
			pos++;
			return value;
		}
		const match = /^(\d+\.?\d*|\.\d+)/.exec(text.slice(pos));
		if (!match) throw new SyntaxError("Expected a number");
		pos += match[0].length;
		return Number(match[0]);
	};

	try {
		const value = expression();
		if (peek() !== undefined) return null;
		return Number.isFinite(value) ? value : null;
	} catch {
		return null;
	}
}
