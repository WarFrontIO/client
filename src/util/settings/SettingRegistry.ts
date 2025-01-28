import {InvalidArgumentException} from "../Exceptions";
import {Setting, SettingCategory} from "./Setting";
import {StringSetting} from "./StringSetting";
import {NumberSetting} from "./NumberSetting";
import {IntegerSetting} from "./IntegerSetting";
import {BooleanSetting} from "./BooleanSetting";
import {CachedEventHandlerRegistry} from "../../event/CachedEventHandlerRegistry";

export const settingAddRegistry = new CachedEventHandlerRegistry<[Setting<unknown>, string]>();

/**
 * Important Note: For types to work correctly, all register calls must be chained together.
 * @internal
 */
export class SettingRegistry<T extends Record<string, Setting<unknown>>> {
	private registry: T = {} as T;

	private constructor(private readonly prefix: string) {}

	/**
	 * Create a new setting registry
	 * Warning: The prefix parameter has to be unique for each setting registry
	 * @param prefix the prefix of the setting keys, must not contain '@'
	 * @throws InvalidArgumentException if the prefix contains '@'
	 * @internal
	 */
	static init(prefix: string) {
		if (prefix.includes("@")) throw new InvalidArgumentException("Prefix cannot contain '@'");
		return new SettingRegistry<{}>(prefix);
	}

	/**
	 * Register a setting
	 * @param key stringy id of the setting
	 * @param setting the setting object
	 * @see Setting
	 */
	register<K extends string, S, R extends Setting<S>>(key: K & Exclude<K, keyof T>, setting: Setting<S> & R): SettingRegistry<T & Record<K, R>> {
		settingAddRegistry.broadcast(setting as Setting<unknown>, key);
		(this.registry as unknown as Record<K, R>)[key] = setting;
		return this as unknown as SettingRegistry<T & Record<K, R>>;
	}

	registerString<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: string, category: SettingCategory | null, version: number = 0) {
		return this.register<K, string, StringSetting>(key, new StringSetting(defaultValue, category, version));
	}

	registerNumber<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: number, category: SettingCategory | null, version: number = 0) {
		return this.register<K, number, NumberSetting>(key, new NumberSetting(defaultValue, category, version));
	}

	registerInteger<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: number, category: SettingCategory | null, version: number = 0) {
		return this.register<K, number, IntegerSetting>(key, new IntegerSetting(defaultValue, category, version));
	}

	registerBoolean<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: boolean, category: SettingCategory | null, version: number = 0) {
		return this.register<K, boolean, BooleanSetting>(key, new BooleanSetting(defaultValue, category, version));
	}

	/**
	 * Register an updater for a setting
	 * @param key the key of the setting
	 * @param version the version of the setting
	 * @param updater the updater function
	 */
	registerUpdater<K extends string>(key: K, version: number, updater: (value: string) => string) {
		this.registry[key].registerUpdater(version, updater);
		return this;
	}

	/**
	 * Load all settings from local storage
	 */
	load() {
		for (const key in this.registry) {
			const setting = this.registry[key];
			const value = localStorage.getItem(`${this.prefix}@${key}`);
			if (value && value.match(/^.*:\d+$/)) {
				try {
					const result = value.match(/^(.*):(\d+)$/);
					if (result) {
						setting.parse(this, key, result[1], parseInt(result[2]));
					} else {
						console.warn(`Failed to load setting ${key}: Invalid format`);
					}
				} catch (e) {
					console.error(`Failed to load setting ${key}:`, e);
				}
			}
			setting.callListeners();
		}
	}

	/**
	 * Save a setting to local storage
	 */
	saveSetting<K extends string & keyof T>(key: K) {
		const setting = this.registry[key];
		localStorage.setItem(`${this.prefix}@${key}`, `${setting.toString()}:${setting.getVersion()}`);
	}

	/**
	 * Get a setting
	 * @param key the key of the setting
	 * @returns the setting object
	 * @see Setting
	 */
	get<K extends keyof T>(key: K): T[K] {
		return this.registry[key];
	}

	/**
	 * Get all settings
	 * @returns an array of all settings
	 */
	getAll() {
		return this.registry;
	}
}