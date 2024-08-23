import {getUserToken} from "../NetworkAuthenticator";
import {getSetting} from "../../util/UserSettingManager";

/**
 * Constructs a get endpoint function.
 * @param url Base URL
 * @param auth Whether to use authentication
 */
export function endpointGET<T extends string>(url: T, auth: boolean = false) {
	return function <P extends Record<string, string>, R extends { [key: number]: unknown }>() {
		return function (params: P & ExtractParams<T>): APIResponse<R, never> {
			return APIResponse.get<R>(fillPathParams(url, params), params, auth);
		}
	}
}

/**
 * Constructs a post endpoint function.
 * @param url Base URL
 * @param auth Whether to use authentication
 */
export function endpointPOST<T extends string>(url: T, auth: boolean = false) {
	return function <P extends Record<string, string>, R extends { [key: number]: unknown }>() {
		return function (params: P & ExtractParams<T>): APIResponse<R, never> {
			return APIResponse.post<R>(fillPathParams(url, params), params, auth);
		}
	}
}

/**
 * Fills the path parameters in the URL with the given parameters and removes them from the object
 * @param url URL to fill
 * @param params Parameters to fill the URL with
 */
function fillPathParams<T extends string, U extends ExtractParams<T> & Record<string, string>>(url: T, params: U) {
	return url.replace(/{([^}]+)}/g, (_, key: keyof U) => {
		const value = params[key];
		delete params[key];
		return value;
	});
}

class APIResponse<T extends { [key: number]: unknown }, E extends keyof T> {
	private listeners: { [K in keyof T]?: ((data: T[K]) => void) } = {};
	private errorListener: ((data: { [K in keyof T]: { error: false, code: K, data: T[K] } }[keyof T] | { error: true, data: unknown }) => void) | null = null;
	private result: { [K in keyof T]: { error: false, code: K, data: T[K] } }[keyof T] | { error: true, data: unknown } | null = null;

	constructor(url: string, options: Promise<RequestInit>) {
		options.then(options => {
			fetch(getSetting("api-location") + url, options).then(response => {
				if (response.headers.get("Content-Type") === "application/json") {
					response.json().then(data => {
						this.handleResponse(response.status as keyof T, data as T[keyof T]);
					}).catch(this.handleError.bind(this));
				} else {
					//Let's assume (hope) that the response is text
					response.text().then(data => {
						this.handleResponse(response.status as keyof T, data as T[keyof T]);
					}).catch(this.handleError.bind(this));
				}
			}).catch(this.handleError.bind(this));
		}).catch(this.handleError.bind(this))
	}

	/**
	 * Handles the response from the server.
	 * @param status Status code of the response
	 * @param data Data of the response
	 * @private
	 */
	private handleResponse<K extends keyof T>(status: K, data: T[K]) {
		const listener = this.listeners[status];
		if (listener) {
			listener(data);
		} else if (this.errorListener) {
			this.errorListener({error: false, code: status, data} as { error: false, code: K, data: T[K] });
		}
		this.result = {error: false, code: status, data} as { error: false, code: K, data: T[K] };
	}

	/**
	 * Handles an error during the request.
	 * @param error Error that occurred
	 * @private
	 */
	private handleError(error: unknown) {
		if (this.errorListener) {
			this.errorListener({error: true, data: error});
		}
		this.result = {error: true, data: error};
	}

	/**
	 * Adds a listener for the given status code.
	 * @param status Status code to listen for
	 * @param callback Callback to call when the status code is received
	 */
	on<K extends keyof T>(status: K & Exclude<K, E>, callback: (data: T[K]) => void) {
		//Note: We assign the listener even if we already have a result, because it might be important to the error listener
		this.listeners[status] = callback;

		if (this.result) {
			if (!this.result.error && this.result.code === status) {
				callback(this.result.data as T[K]);
			}
		}
		return this as APIResponse<T, E | K>;
	}

	/**
	 * Adds a listener for any unhanded status code or error.
	 * @param callback Callback to call when an unhandled status code is received
	 */
	catch(callback: (data: { [K in keyof T]: { error: false, code: K, data: T[K] } }[keyof T] | { error: true, data: unknown }) => void) {
		if (this.result) {
			callback(this.result);
		} else {
			this.errorListener = callback;
		}
	}

	/**
	 * Sends a GET request to the given URL with the given parameters.
	 * @param url URL to send the request to
	 * @param params query parameters to send
	 * @param auth Whether to use authentication
	 */
	static get<T extends { [key: number]: unknown }>(url: string, params: Record<string, string>, auth: boolean) {
		const options = {method: "GET"};
		return new APIResponse<T, never>(url + "?" + (new URLSearchParams(params)).toString(), auth ? getUserToken().refresh().then(token => token.addAuth(options)) : Promise.resolve(options));
	}

	/**
	 * Sends a POST request to the given URL with the given parameters.
	 * @param url URL to send the request to
	 * @param params body parameters to send
	 * @param auth Whether to use authentication
	 */
	static post<T extends { [key: number]: unknown }>(url: string, params: Record<string, string>, auth: boolean) {
		const options = {method: "POST", body: new URLSearchParams(params), headers: {"Content-Type": "application/x-www-form-urlencoded"}};
		return new APIResponse<T, never>(url, auth ? getUserToken().refresh().then(token => token.addAuth(options)) : Promise.resolve(options));
	}
}

type ExtractParams<T extends string> = T extends `${infer _}{${infer P}}${infer R}` ? Record<P, string> & ExtractParams<R> : {};