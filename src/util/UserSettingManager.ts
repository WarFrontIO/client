import {SettingRegistry} from "./SettingRegistry";

/**
 * Setting registry, all register calls need to be chained together
 */
const registry = SettingRegistry.init()

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
	registry.get(key).value = value;
	registry.saveSetting(key);
}