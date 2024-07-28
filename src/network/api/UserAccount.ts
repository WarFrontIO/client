import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";

let userAccount: UserAccount | null = null;

/**
 * Updates the current user account
 * @param account new account
 * @internal
 */
export function updateUserAccount(account: APIUserAccount | null) {
	if (userAccount === account) return;
	if (account === null || userAccount === null || account.id !== userAccount.id || account.username !== userAccount.username || account.avatar_url !== userAccount.avatarURL) {
		userAccount = account === null ? null : {
			id: account.id,
			service: account.service,
			serviceId: account.user_id,
			username: account.username,
			avatarURL: account.avatar_url
		};
		accountSwitchHandler.broadcast();
	}
}

/**
 * Gets the current user account
 * NOTE: For display purposes use the registry below instead
 */
export function getUserAccount(): UserAccount | null {
	return userAccount;
}

export const accountSwitchHandler: EventHandlerRegistry<[UserAccount | null]> = new EventHandlerRegistry(true, listener => listener(userAccount));

export type UserAccount = {
	readonly id: string;
	/** authentication service */
	readonly service: string;
	/** user ID on the service */
	readonly serviceId: string;
	readonly username: string;
	readonly avatarURL: string;
};
export type APIUserAccount = {
	id: string;
	service: string;
	user_id: string;
	username: string;
	avatar_url: string;
};