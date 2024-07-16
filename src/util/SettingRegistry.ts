import {UnsupportedDataException} from "./exception/UnsupportedDataException";

/**
 * Important Note: For types to work correctly, all register calls must be chained together.
 * @internal
 */
export class SettingRegistry<T extends Record<string, Setting<unknown>>> {
	private registry: T = {} as T;
	private updaters: Record<string, Record<number, (value: string) => string>> = {};

	/**
	 * Create a new setting registry
	 * @internal
	 */
	static init() {
		return new SettingRegistry<{}>();
	}

	/**
	 * Register a setting
	 * @param key stringy id of the setting
	 * @param setting the setting object
	 * @see Setting
	 */
	register<K extends string, S>(key: K & Exclude<K, keyof T>, setting: Setting<S>): SettingRegistry<T & Record<K, Setting<S>>> {
		(this.registry as unknown as Record<K, Setting<S>>)[key] = setting;
		return this as unknown as SettingRegistry<T & Record<K, Setting<S>>>;
	}

	/**
	 * Register a simple updatable setting
	 * Requires the setting type to implement a toString method
	 * @param key stringy id of the setting
	 * @param defaultValue the default value of the setting
	 * @param decode the decode function of the setting
	 * @param version the version of the setting
	 */
	registerUpdatable<K extends string, U extends {toString: (this: U) => string}>(key: K & Exclude<K, keyof T>, defaultValue: U, decode: (this: void, value: string) => U, version: number = 0) {
		return this.register<K, U>(key, {
			encode: function (this: U) { return this.toString(); },
			decode: this.decodeUpdatable.bind(this, key, defaultValue, decode) as Setting<U>["decode"],
			defaultValue,
			value: defaultValue,
			version
		});
	}

	/**
	 * Decode an updatable setting or return the default value if decoding fails
	 * @param key the key of the setting
	 * @param defaultValue the default value of the setting
	 * @param decode the decode function of the setting
	 * @param value the value to decode
	 * @param version the version of the setting
	 */
	private decodeUpdatable<U>(key: string & keyof T, defaultValue: U, decode: (this: void, value: string) => U, value: string, version: number): U {
		try {
			return decode(this.applyUpdaters(key, value, version));
		} catch (e) {
			console.warn(`Failed to decode setting ${key}:`, e);
			return defaultValue;
		}
	}

	/**
	 * Apply all available updaters to a setting
	 * @param key the key of the setting
	 * @param value the value to update
	 * @param oldVer the version of the value prior to the update
	 * @throws UnsupportedDataException if no fitting updater is found
	 */
	private applyUpdaters(key: string & keyof T, value: string, oldVer: number): string {
		const setting = this.registry[key];
		if (!setting.version || oldVer >= setting.version) return value;
		while (setting.version > oldVer) {
			const updater = this.updaters[key][oldVer];
			if (updater) {
				value = updater(value);
				oldVer++;
			} else {
				// We don't save the setting here, in case the updater is added later
				throw new UnsupportedDataException(`No updater found for setting ${key} from version ${oldVer}`);
			}
		}
		this.saveSetting(key);
		return value;
	}

	registerString<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: string, version: number = 0) {
		return this.registerUpdatable<K, string>(key, defaultValue, String, version);
	}

	registerNumber<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: number, version: number = 0) {
		return this.registerUpdatable<K, number>(key, defaultValue, parseFloat, version);
	}

	registerInteger<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: number, version: number = 0) {
		return this.registerUpdatable<K, number>(key, defaultValue, parseInt, version);
	}

	registerBoolean<K extends string>(key: K & Exclude<K, keyof T>, defaultValue: boolean, version: number = 0) {
		return this.registerUpdatable<K, boolean>(key, defaultValue, value => value === "true", version);
	}

	/**
	 * Register an updater for a setting
	 * @param key the key of the setting
	 * @param version the version of the setting
	 * @param updater the updater function
	 */
	registerUpdater<K extends string>(key: K, version: number, updater: (value: string) => string) {
		if (!this.updaters[key]) {
			this.updaters[key] = {};
		}
		this.updaters[key][version] = updater;
		return this;
	}

	/**
	 * Load all settings from local storage
	 */
	load() {
		for (const key in this.registry) {
			const setting = this.registry[key];
			const value = localStorage.getItem(key);
			if (value && value.match(/^.*:\d+$/)) {
				try {
					const result = value.match(/^(.*):(\d+)$/);
					if (result) {
						setting.value = setting.decode(result[1], parseInt(result[2]));
					} else {
						console.warn(`Failed to load setting ${key}: Invalid format`);
					}
				} catch (e) {
					console.error(`Failed to load setting ${key}:`, e);
				}
			}
		}
	}

	/**
	 * Save a setting to local storage
	 */
	saveSetting<K extends string & keyof T>(key: K) {
		const setting = this.registry[key];
		localStorage.setItem(key, `${setting.encode.call(setting.value)}:${setting.version}`);
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
		const result: Setting<unknown>[] = [];
		for (const key in this.registry) {
			result.push(this.registry[key]);
		}
		return result;
	}
}

/**
 * Setting object
 * Requires encode and decode function to load and save the setting
 */
export type Setting<T> = {
	encode: (this: T) => string,
	decode: (this: Setting<T>, value: string, version: number) => T,
	defaultValue: T,
	value: T,
	version?: number
}