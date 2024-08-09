/**
 * Reduces the chance of accidentally overwriting a cookie value that was changed by another script.
 * Since cookies (like most things in JavaScript) do not provide a proper mutex, this sadly does not fully prevent race conditions.
 *
 * WARNING: Only call a chain of both methods in a synchronous context.
 * That means nothing else should access this context in between the get and set calls.
 */
export class CookieContext {
	private lastSeenValue: string | null = null;

	constructor(private cookie: string) {}

	/**
	 * Gets the cookie value.
	 */
	get(): string | null {
		return this.lastSeenValue = this.fetchValue();
	}

	private fetchValue(): string | null {
		const matches = document.cookie.match(new RegExp(`(^|;)\\s*${this.cookie}\\s*=\\s*([^;]+)`));
		if (matches) {
			return matches.pop() as string;
		}
		return null;
	}

	/**
	 * Sets the cookie value.
	 * @param value new value
	 * @param lifetime The lifetime of the cookie in days.
	 * @returns Whether the value was set successfully.
	 */
	set(value: string, lifetime: number): boolean {
		if (this.lastSeenValue !== this.fetchValue()) {
			/**
			 * The value of the cookie has changed since the last time we checked.
			 * This means that the cookie was changed by another script, e.g. on another tab.
			 * We do not want to overwrite the value in this case.
			 */
			return false;
		}
		this.forceSet(value, lifetime);
		return true;
	}

	/**
	 * Forces the cookie value to be set.
	 * WARNING: This will overwrite any changes made by other scripts.
	 * @param value new value
	 * @param lifetime The lifetime of the cookie in days.
	 */
	forceSet(value: string, lifetime: number): void {
		document.cookie = `${this.cookie}=${value}; expires=${new Date(Date.now() + lifetime * 24 * 60 * 60 * 1000).toUTCString()}; path=/; SameSite=Strict; Secure`;
	}
}