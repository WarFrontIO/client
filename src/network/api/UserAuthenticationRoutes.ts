import {endpointPOST} from "./Endpoint";
import {awaitSafeForward} from "../NetworkAuthenticator";
import {getSetting} from "../../util/UserSettingManager";
import {APIUserAccount} from "./UserAccount";

/**
 * Redirects the user to the login page for the given service
 * @param service The service to log in with
 */
export function loginUser(service: "discord") {
	awaitSafeForward().then(() => {
		window.location.href = getSetting("api-location") + "/login/" + service;
	}).catch(() => {});
}

/**
 * Request a new access token using the refresh token, this will invalidate the old access token.
 * @param token The refresh token
 * @param device The device ID
 * @internal
 */
export const refreshToken = endpointPOST("/refresh/")<{ token: string, device: string }, { 200: { access_token: string, expires_in: number, refresh_token: string, user: APIUserAccount }, 400: void, 401: string, 500: string }>();

/**
 * Revoke the refresh token, this will invalidate the specified refresh token.
 * @param token The refresh token
 */
export const revokeToken = endpointPOST("/revoke/")<{ token: string }, { 200: void, 400: void }>();

/**
 * Logout the user. Other than revoke, this invalidates all refresh tokens for the user.
 */
export const logoutUser = endpointPOST("/logout/", true)<{}, { 200: void, 401: string }>();