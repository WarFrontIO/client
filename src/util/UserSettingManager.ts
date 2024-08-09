import {SettingRegistry} from "./SettingRegistry";
import {getTheme} from "../renderer/GameTheme";

/**
 * Setting registry, all register calls need to be chained together
 */
const registry = SettingRegistry.init()
	.registerUpdatable("theme", getTheme("pastel"), (value: string) => getTheme(value))
	.registerString("playerName", "UnknownPlayer")
	.registerBoolean("gameHud-clock", true)
	.registerString("api-location", "https://warfront.io/api") //This needs to enforce no trailing slash, no query parameters and a protocol
	.registerString("game-server", "warfront.io")

registry.load();

const listeners: Record<string, ((value: any) => void)[]> = {};

/**
 * Get a setting value
 * @param key identifier of the setting
 */
export function getSetting<K extends keyof typeof registry["registry"]>(key: K): typeof registry["registry"][K]["value"] {
	return registry.get(key).value;
}

/**
 * Update and save a setting value
 * @param key identifier of the setting
 * @param value new value
 */
export function updateSetting<K extends keyof typeof registry["registry"]>(key: K, value: typeof registry["registry"][K]["value"]) {
	if (listeners[key]) {
		for (const listener of listeners[key]) {
			listener(value);
		}
	}

	registry.get(key).value = value;
	registry.saveSetting(key);
}

/**
 * Register a setting listener that will be called before the value is updated
 * @param key identifier of the setting
 * @param listener listener to register, argument is the new value of the setting
 */
export function registerSettingListener<K extends keyof typeof registry["registry"]>(key: K, listener: (value: typeof registry["registry"][K]["value"]) => void) {
	if (!listeners[key]) listeners[key] = [];
	listeners[key].push(listener);
}