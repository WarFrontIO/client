import {SettingRegistry} from "./SettingRegistry";
import {getTheme} from "../renderer/GameTheme";

/**
 * Setting registry, all register calls need to be chained together
 */
const registry = SettingRegistry.init("wf")
	.registerUpdatable("theme", getTheme("pastel"), (value: string) => getTheme(value))
	.registerString("player-name", "Unknown Player")
	.registerBoolean("hud-clock", true)

registry.load();

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
	registry.get(key).registry.broadcast(value as never);
	registry.get(key).value = value;
	registry.saveSetting(key);
}

/**
 * Register a setting listener that will be called before the value is updated
 * @param key identifier of the setting
 * @param listener listener to register, argument is the new value of the setting
 * @param callImmediately if true, the listener is called immediately after registration
 */
export function registerSettingListener<K extends keyof typeof registry["registry"]>(key: K, listener: (value: typeof registry["registry"][K]["value"]) => void, callImmediately: boolean = false) {
	registry.get(key).registry.register(listener);
	if (callImmediately) listener(getSetting(key));
}