/**
 * A promise that will reject if it takes too long to resolve.
 * Guarantees that the promise will resolve or reject within the given time.
 */
export function timedPromise<T>(timeout: number, executor: (resolve: (value: T) => void, reject: (reason?: unknown) => void) => void) {
	return Promise.race([
		new Promise<T>(executor),
		new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Time out")), timeout))
	]);
}