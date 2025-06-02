import type {APIUserAccount} from "../protocol/util/ProtocolUtils";
import {endpointPOST} from "./Endpoint";

/**
 * Redirects the user to the login page for the given service
 * @param service The service to log in with
 * @param state The state to use for the login
 * @internal Use {@link login} instead
 */
export function loginUser(service: "discord", state: string) {
	const url = new URL("/api/login/" + service, window.location.origin);
	url.searchParams.append("redirect", new URL("auth", window.location.origin).toString());
	url.searchParams.append("state", state);
	window.location.href = url.toString();
}

/**
 * Request a new refresh token using authentication code.
 * @param token The authentication code
 * @internal
 */
export const requestToken = endpointPOST("/token/")<{token: string}, {200: string, 400: undefined, 401: string, 500: string}>();

/**
 * Request a new access token using the refresh token, this will invalidate the old access token.
 * @param token The refresh token
 * @internal
 */
export const refreshToken = endpointPOST("/token/")<{token: string}, {200: {access_token: string, expires_in: number, refresh_token: string, user: APIUserAccount}, 400: undefined, 401: string, 500: string}>();

/**
 * Request a new external access token for the given host.
 * @param host The host to request the token for
 */
export const requestTokenExternal = endpointPOST("/token/external/", true)<{host: string}, {200: string, 400: undefined, 401: string, 500: undefined}>();

/**
 * Revoke the refresh token, this will invalidate the specified refresh token.
 * @param token The refresh token
 */
export const revokeToken = endpointPOST("/revoke/")<{token: string}, {200: undefined, 400: undefined}>();

/**
 * Logout the user. Other than revoke, this invalidates all refresh tokens for the user.
 */
export const logoutUser = endpointPOST("/logout/", true)<{}, {200: undefined, 401: string}>();