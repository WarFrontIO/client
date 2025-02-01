/**
 * These types are used to bypass the type system in some cases.
 * When used correctly, all possible runtime errors are still caught by the type system as these should block all invalid calls.
 *
 * In a bunch of places, we expect a generic class to be assignable to the specific class with unknown as generic type.
 * This doesn't work due to function bivariance (unknown would be callable using any type, which would lead to runtime errors when the more specific type is expected).
 * As a hack, we treat unknowns as a wildcard to allow the assignments, but block all calls when unknowns are in the type, to not run into runtime errors.
 */
export type StripUnknownParams<T extends unknown[]> = {
	[K in keyof T]: StripUnknown<T[K]>
};
export type StripUnknown<T, R = T> = unknown extends T ? never : R;
export type PassUnknown<T, R> = unknown extends T ? unknown : R;