/**
 * Util to provide a reusable promise, only executing the method once at a time.
 */
export function buildPromiseBundle<T extends unknown[], R>(method: ((...args: T) => Promise<R>)) {
	let promise: Promise<R> | undefined;

	const func: ((...args: T) => Promise<R>) & { isPending: () => boolean } = (...args: T) => {
		if (!promise) {
			promise = method(...args);
			promise.then(() => {
				promise = undefined;
			}).catch(() => {
				promise = undefined;
			});
		}
		return promise;
	};
	func.isPending = () => !!promise;
	return func;
}