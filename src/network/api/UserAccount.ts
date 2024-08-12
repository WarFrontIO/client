import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";
import {apiToUserAccount, APIUserAccount, UserAccount} from "../protocol/util/ProtocolUtils";

let userAccount: UserAccount | null = null;

/**
 * Updates the current user account
 * @param account new account
 * @internal
 */
export function updateUserAccount(account: APIUserAccount | null) {
	if (userAccount === account) return;
	if (account === null || userAccount === null || account.id !== userAccount.id || account.username !== userAccount.username || account.avatar_url !== userAccount.avatarURL) {
		userAccount = account === null ? null : apiToUserAccount(account);
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