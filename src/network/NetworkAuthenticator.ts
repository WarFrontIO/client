import {buildPromiseBundle} from "../util/PromiseBundle";
import {CookieContext} from "../util/CookieContext";
import {updateUserAccount} from "./api/UserAccount";
import {loginUser, refreshToken, revokeToken} from "./api/UserAuthenticationRoutes";
import {InvalidArgumentException} from "../util/exception/InvalidArgumentException";
import {openModule} from "../ui/ModuleLoader";

type UserToken = {
	/**
	 * Refreshes the user token if necessary.
	 */
	refresh: () => Promise<UserToken>;
	/**
	 * Adds authentication to a request configuration.
	 * @param conf The request configuration (without authentication)
	 * @returns The request configuration with authentication (if necessary)
	 */
	addAuth: (conf: RequestInit) => RequestInit;
	/**
	 * Gets the raw token.
	 */
	getRawToken: () => string | undefined;
};

class ActualUserToken implements UserToken {
	constructor(private token: string, private expires: number) {}

	refresh(): Promise<UserToken> {
		if (Date.now() < this.expires) {
			return Promise.resolve(this);
		}
		return fetchUserToken();
	}

	addAuth(conf: RequestInit): RequestInit {
		return {
			...conf,
			headers: {
				...conf.headers,
				Authorization: `Bearer ${this.token}`
			}
		};
	}

	getRawToken(): string {
		return this.token;
	}
}

class InvalidUserToken implements UserToken {
	refresh(): Promise<UserToken> {
		return Promise.resolve(this);
	}

	addAuth(conf: RequestInit): RequestInit {
		return conf;
	}

	getRawToken(): undefined {
		return undefined;
	}
}

let userToken: UserToken = new ActualUserToken("", 0); // Dummy token to cause a fetch on first use

const refreshTokenCookie = new CookieContext("token");

/**
 * Gets the current user token.
 * @returns The user token
 */
export function getUserToken(): UserToken {
	return userToken;
}

/**
 * Fetches the user token.
 * @returns Promise that resolves to the user token
 */
const fetchUserToken = buildPromiseBundle(() => {
	return new Promise<UserToken>((resolve) => {
		tryFetchUserToken(resolve, 0);
	});
});

/**
 * @internal
 */
function tryFetchUserToken(resolve: (token: UserToken) => void, retries: number) {
	const token = refreshTokenCookie.get();
	if (token === null) {
		updateUserAccount(null);
		resolve(userToken = new InvalidUserToken());
		return;
	}
	refreshToken({token})
		.on(200, data => {
			refreshTokenCookie.forceSet(data.refresh_token, 29);
			updateUserAccount(data.user);
			resolve(userToken = new ActualUserToken(data.access_token, Date.now() + data.expires_in * 1000));
		})
		.on(401, () => {
			// Another tab might have refreshed the token while we were waiting for the response.
			if (refreshTokenCookie.set("", -1)) {
				updateUserAccount(null);
				resolve(userToken = new InvalidUserToken());
			} else {
				if (retries < 3) {
					tryFetchUserToken(resolve, retries + 1);
				} else {
					console.warn("Failed to fetch user token after 3 retries");
					updateUserAccount(null);
					resolve(userToken = new InvalidUserToken());
				}
			}
		})
		.catch(err => {
			console.warn("Failed to fetch user token");
			console.log(err);
			updateUserAccount(null);
			resolve(userToken = new InvalidUserToken());
		});
}

/**
 * Awaits the user token to be fetched.
 * Make sure to use this if processes could interfere with the token fetch.
 * This will prevent requesting a new token and as such invalidate the current one without managing to store the new one.
 * Actions such as redirecting the user to a different page should be delayed until the token is fetched.
 * @returns Promise that resolves when the user token is fetched
 */
export function awaitSafeForward(): Promise<void> {
	if (fetchUserToken.isPending()) {
		return new Promise((resolve, reject) => {
			fetchUserToken().then(() => resolve()).catch((e: Error) => reject(e));
		});
	}
	return Promise.resolve();
}

export function login(service: "discord") {
	const state = Math.random().toString(36).substring(2, 15);
	awaitSafeForward().then(() => {
		sessionStorage.setItem("authState", state);
		loginUser(service, state);
	}).catch(() => {});
}

/**
 * Logs out the user.
 */
export function logout() {
	revokeToken({token: refreshTokenCookie.get() ?? ""})
	refreshTokenCookie.forceSet("", -1);
	userToken = new InvalidUserToken();
	updateUserAccount(null);
}

/**
 * Handles the authentication callback.
 * @param params The URL parameters
 * @param _path The path
 * @throws InvalidArgumentException If the parameters are invalid
 */
export function handleAuthCallback(params: URLSearchParams, _path: string[]) {
	const token = params.get("token");
	const state = params.get("state");
	if (token === null) {
		throw new InvalidArgumentException("Missing token");
	}
	if (state === null || sessionStorage.getItem("authState") === null || state !== sessionStorage.getItem("authState")) {
		throw new InvalidArgumentException("State mismatch");
	}
	refreshTokenCookie.forceSet(token, 29);
	sessionStorage.removeItem("authState");
	window.history.replaceState(null, "", "/");
	//TODO: Show a tooltip that the user was logged in
	openModule("MainMenu");
}