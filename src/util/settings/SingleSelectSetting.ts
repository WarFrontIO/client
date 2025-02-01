import {Setting, SettingCategory} from "./Setting";
import {StripUnknown} from "../UnsafeTypes";

export class SingleSelectSetting<T> extends Setting<T> {
	readonly type = "single-select";

	private options: Record<string, Option<T>> = {};
	private selected: string;

	static init<T = never>(defaultId: string, category: SettingCategory | null, version: number = 0): SingleSelectSetting<T> & Setting<T> {
		return new SingleSelectSetting<T>(defaultId, category, version);
	}

	private constructor(defaultId: string, category: SettingCategory | null, version: number = 0) {
		super({} as T, category, version);
		this.selected = defaultId;
	}

	/**
	 * Registers a new option with the given key and value.
	 * @param key The key of the option. Must be unique, not contain ',' and shouldn't change in the future
	 * @param value The value of the option
	 * @param label The label of the option, displayed in the UI
	 * @throws InvalidArgumentException if the key contains ','
	 */
	option<S extends StripUnknown<T>>(key: string, value: S, label: string): SingleSelectSetting<T | S> {
		(this.options as Record<string, Option<T | S>>)[key] = {value, label};
		if (key === this.selected) (this as SingleSelectSetting<T | S>).set(value);
		return this as SingleSelectSetting<T | S>;
	}

	/**
	 * Fills the given options into this setting.
	 * @param options The options to fill into this setting
	 */
	fillOptions(options: Record<string, StripUnknown<T>>) {
		for (const key in options) {
			this.option(key, options[key], key);
		}
	}

	/**
	 * Selects the option with the given key.
	 * @param key The key of the option
	 */
	select(key: string) {
		if (!this.options[key]) throw new Error(`Option with key ${key} does not exist`);
		this.selected = key;
		this.set(this.options[key].value as StripUnknown<T>);
	}

	toString() {
		return this.selected;
	}

	fromString(value: string) {
		this.selected = value;
		if (this.options[value]) {
			this.value = this.options[value].value;
			this.initialized = true;
		}
	}
}

type Option<T> = {
	value: T;
	label: string;
}