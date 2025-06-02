import type {Setting, SettingCategory} from "./Setting";
import {InvalidArgumentException} from "../Exceptions";
import {StringSetting} from "./StringSetting";
import {NumberSetting} from "./NumberSetting";
import {IntegerSetting} from "./IntegerSetting";
import {BooleanSetting} from "./BooleanSetting";
import {CachedEventHandlerRegistry} from "../../event/CachedEventHandlerRegistry";

export const settingAddRegistry = new CachedEventHandlerRegistry<[Setting<unknown>]>();

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
	 * @param prefix the prefix of the setting keys, must not contain '@' or '.'
	 * @throws InvalidArgumentException if the prefix contains '@' or '.'
	 * @internal
	 */
	static init(prefix: string) {
		if (prefix.includes("@") || prefix.includes(".")) throw new InvalidArgumentException("Prefix cannot contain '@' or '.'");
		return new SettingRegistry<{}>(prefix);
	}

	/**
	 * Register a setting
	 * @param key stringy id of the setting, must not contain '.'
	 * @param setting the setting object
	 * @see Setting
	 */
	register<K extends string, R>(key: K & Exclude<K, keyof T>, setting: R extends Setting<infer _> ? R : never): SettingRegistry<T & Record<K, R>> {
		if (key.includes(".")) throw new InvalidArgumentException("Key cannot contain '.'");
		setting.load(`${this.prefix}@${key}`);
		settingAddRegistry.broadcast(setting);
		(this.registry as unknown as Record<K, R>)[key] = setting;
		return this as unknown as SettingRegistry<T & Record<K, R>>;
	}

	registerString<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: string, category: SettingCategory | null, version: number = 0) {
		return this.register<K, StringSetting>(key, new StringSetting(defaultValue, category, version));
	}

	registerNumber<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: number, category: SettingCategory | null, version: number = 0) {
		return this.register<K, NumberSetting>(key, new NumberSetting(defaultValue, category, version));
	}

	registerInteger<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: number, category: SettingCategory | null, version: number = 0) {
		return this.register<K, IntegerSetting>(key, new IntegerSetting(defaultValue, category, version));
	}

	registerBoolean<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: boolean, category: SettingCategory | null, version: number = 0) {
		return this.register<K, BooleanSetting>(key, new BooleanSetting(defaultValue, category, version));
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