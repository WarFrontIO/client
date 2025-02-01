import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";
import {IllegalStateException, UnsupportedDataException} from "../Exceptions";
import {SettingRegistry} from "./SettingRegistry";
import {PassUnknown, StripUnknown} from "../UnsafeTypes";

export abstract class Setting<T> {
	readonly abstract type: string;
	protected initialized = false;

	protected value: T;
	private readonly category: SettingCategory | null;
	private readonly version: number;

	protected registry: EventHandlerRegistry<[T, PassUnknown<T, Setting<T>>]> = new EventHandlerRegistry();
	protected readonly updaters: Record<string, (value: string) => string> = {};

	constructor(defaultValue: T, category: SettingCategory | null = null, version: number = 0) {
		this.value = defaultValue;
		this.category = category;
		this.version = version;
	}

	/**
	 * Returns the value of this setting.
	 * @throws IllegalStateException if the setting has not been initialized
	 */
	get(): T {
		if (!this.initialized) throw new IllegalStateException("Setting has not been initialized");
		return this.value;
	}

	/**
	 * Sets the value of this setting.
	 */
	set(value: StripUnknown<T>): void {
		this.registry.broadcast(value, this as unknown as StripUnknown<PassUnknown<T, Setting<T>>>);
		this.value = value;
		this.initialized = true;
	}

	/**
	 * Returns whether this setting has been initialized.
	 * This does only require the setting to have *some* valid value, not necessarily all options for more complex settings.
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * @returns the version of this setting
	 */
	getVersion(): number {
		return this.version;
	}

	/**
	 * @returns the category of this setting or null if it has none
	 */
	getCategory(): SettingCategory | null {
		return this.category;
	}

	/**
	 * Registers a listener for this setting.
	 * @param callback The callback to register, called before the value is updated with the new value
	 */
	registerListener(callback: (value: T, obj: PassUnknown<T, Setting<T>>) => void): void {
		this.registry.register(callback);
		if (this.initialized) callback(this.value, this as unknown as StripUnknown<PassUnknown<T, Setting<T>>>);
	}

	/**
	 * Registers an updater for this setting.
	 * @param version The version of the updater
	 * @param updater The updater to register
	 */
	registerUpdater(version: number, updater: (value: string) => string): void {
		this.updaters[version] = updater;
	}

	/**
	 * Returns a string representation of this settings value.
	 */
	abstract toString(): string;

	/**
	 * Parses a string to set the value of this setting.
	 * Use {@link parse} for non-internal use.
	 * @param value The string to parse
	 */
	protected abstract fromString(value: string): void;

	/**
	 * Parses a string to set the value of this setting.
	 * @param registry The registry of the setting
	 * @param key The key of the setting
	 * @param value The string to parse
	 * @param version The version of the setting
	 */
	parse(registry: SettingRegistry<Record<string, Setting<unknown>>>, key: string, value: string, version: number): void {
		try {
			this.fromString(this.applyUpdaters(registry, key, value, version));
		} catch (e) {
			console.warn(`Failed to decode setting ${key}:`, e);
		}
	}

	/**
	 * Applies all available updaters to a setting.
	 * @param registry The registry of the setting
	 * @param key The key of the setting
	 * @param value The value to update
	 * @param oldVer The version of the value prior to the update
	 * @throws UnsupportedDataException if no fitting updater is found
	 * @private
	 */
	private applyUpdaters(registry: SettingRegistry<Record<string, Setting<unknown>>>, key: string, value: string, oldVer: number): string {
		while (oldVer < this.version) {
			const updater = this.updaters[oldVer];
			if (updater) {
				value = updater(value);
				oldVer++;
			} else {
				// We don't save the setting here, in case the updater is added later
				throw new UnsupportedDataException(`No updater found for setting ${key} from version ${oldVer}`);
			}
		}
		registry.saveSetting(key);
		return value;
	}

	/**
	 * Calls all listeners for this setting.
	 * @internal This should only be called once after the setting has been loaded
	 */
	callListeners(): void {
		if (this.initialized) this.registry.broadcast(this.value as StripUnknown<T>, this as unknown as StripUnknown<PassUnknown<T, Setting<T>>>);
	}
}

export type SettingCategory = {
	name: string;
	icon: string | null;
};