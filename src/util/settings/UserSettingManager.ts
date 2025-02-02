import {SettingRegistry} from "./SettingRegistry";
import {MultiSelectSetting} from "./MultiSelectSetting";
import {Setting, SettingCategory} from "./Setting";
import {SingleSelectSetting} from "./SingleSelectSetting";
import {GameTheme} from "../../renderer/GameTheme";
import {DebugRendererLayer} from "../../renderer/layer/debug/DebugRenderer";

export const categoryGeneral = {name: "General"} as SettingCategory;
export const interfaceGeneral = {name: "Game Interface"} as SettingCategory;
export const categoryAdvanced = {name: "Advanced"} as SettingCategory;

/**
 * Setting registry, all register calls need to be chained together
 */
const registry = SettingRegistry.init("wf")
	.register("theme", new SingleSelectSetting<GameTheme>("pastel", categoryGeneral))
	.registerString("player-name", "Unknown Player", null)
	.registerBoolean("hud-clock", true, interfaceGeneral)
	.registerString("api-location", "https://warfront.io/api", categoryAdvanced) //This needs to enforce no trailing slash, no query parameters and a protocol
	.registerString("game-server", "warfront.io", categoryAdvanced)
	.register("debug-renderer", MultiSelectSetting.init<DebugRendererLayer>(categoryAdvanced));

/**
 * Get a setting value
 * @param key identifier of the setting
 * @throws IllegalStateException if the setting has not been initialized
 */
export function getSetting<K extends SettingKey>(key: K): SettingType<K> {
	return registry.get(key).get() as SettingType<K>;
}

/**
 * Get a setting object
 * @param key identifier of the setting
 */
export function getSettingObject<K extends SettingKey>(key: K): typeof registry["registry"][K] {
	return registry.get(key);
}

/**
 * Update and save a setting value
 * @param key identifier of the setting
 * @param value new value
 */
export function updateSetting<K extends SettingKey>(key: K, value: SettingType<K>) {
	registry.get(key).set(value as never).save();
}

/**
 * Register a setting listener that will be called before the value is updated or initialized
 * @param key identifier of the setting
 * @param listener listener to register, argument is the new value of the setting
 */
export function registerSettingListener<K extends SettingKey>(key: K, listener: (value: SettingType<K>, obj: typeof registry["registry"][K]) => void) {
	registry.get(key).registerListener(listener as never);
}

export type SettingKey = keyof typeof registry["registry"];
export type SettingType<K extends SettingKey> = typeof registry["registry"][K] extends Setting<infer T> ? T : never;