import {IllegalStateException, UnsupportedDataException} from "../Exceptions";
import {AsymmetricEventHandlerRegistry, ManagedEventHandlerRegistry} from "../../event/ManagedEventHandlerRegistry";

export abstract class Setting<T> {
	readonly abstract type: string;
	protected initialized = false;

	protected readonly defaultValue: T;
	protected value: T;
	private saveId: string;
	private readonly category: SettingCategory | null;
	private readonly version: number;

	protected registry: AsymmetricEventHandlerRegistry<[T], [Setting<T>]> = new AsymmetricEventHandlerRegistry((listener, value) => listener(value ?? this.value, this), listener => this.initialized && listener(this.value, this));
	protected readonly updaters: Record<string, (value: string) => string> = {};

	constructor(defaultValue: T, category: SettingCategory | null = null, version: number = 0) {
		this.defaultValue = defaultValue;
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
	 * @param value The value to set
	 */
	set(value: T) {
		this.registry.broadcast(value);
		this.value = value;
		this.initialized = true;
		return this;
	}

	/**
	 * Returns whether this setting has been initialized.
	 * This does only require the setting to have *some* valid value, not necessarily all options for more complex settings.
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Returns the default value of this setting.
	 */
	getDefaultValue(): T {
		return this.defaultValue;
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
	registerListener(callback: (value: T, obj: this) => void): void {
		this.registry.register(callback as (value: T, obj: Setting<T>) => void);
	}

	/**
	 * @returns the registry for this setting
	 */
	getRegistry<R extends Setting<T> = this>(this: R) {
		return this.registry as unknown as ManagedEventHandlerRegistry<[T, R]>;
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
	 * @param value The string to parse
	 * @param version The version of the setting
	 * @throws Error if the value cannot be parsed
	 */
	parse(value: string, version: number): void {
		this.fromString(this.applyUpdaters(value, version));
		this.save();
		if (this.initialized) this.registry.broadcast(this.value);
	}

	/**
	 * Applies all available updaters to a setting.
	 * @param value The value to update
	 * @param oldVer The version of the value prior to the update
	 * @throws UnsupportedDataException if no fitting updater is found
	 * @private
	 */
	private applyUpdaters(value: string, oldVer: number): string {
		while (oldVer < this.version) {
			const updater = this.updaters[oldVer];
			if (updater) {
				value = updater(value);
				oldVer++;
			} else {
				// We don't save the setting here, in case the updater is added later
				throw new UnsupportedDataException(`No updater found for setting ${this.saveId} from version ${oldVer}`);
			}
		}
		return value;
	}

	/**
	 * Returns the save id of this setting
	 */
	getSaveId(): string {
		return this.saveId;
	}

	/**
	 * Loads the setting from local storage.
	 * @param saveId The id to load the setting from, will later be saved to the same id
	 */
	load(saveId: string): void {
		this.saveId = saveId;
		const value = localStorage.getItem(this.saveId);
		if (value && value.match(/^.*:\d+$/)) {
			try {
				const result = value.match(/^(.*):(\d+)$/);
				if (result) {
					this.parse(result[1], parseInt(result[2]));
				} else {
					console.warn(`Failed to load setting ${this.saveId}: Invalid format`);
				}
			} catch (e) {
				console.error(`Failed to decode setting ${this.saveId}:`, e);
			}
		}
	}

	/**
	 * Save the setting to local storage.
	 * @param saveId The id to save the setting to, defaults to the id used in {@link load}
	 */
	save(saveId: string = this.saveId): void {
		localStorage.setItem(saveId, `${this.toString()}:${this.getVersion()}`);
	}
}

export type SettingCategory = {
	name: string;
	icon: string | null;
};