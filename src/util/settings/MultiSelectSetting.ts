import {InvalidArgumentException} from "../Exceptions";
import {Setting, SettingCategory} from "./Setting";

export class MultiSelectSetting<S, T extends Record<string, Option<S>>> extends Setting<T> {
	readonly type = "multi-select";
	protected initialized: boolean = true; // We pretty much always only check all options, so an empty object is fine

	static init<T = never>(category: SettingCategory | null, version: number = 0) {
		return new MultiSelectSetting<T, {}>(category, version);
	}

	constructor(category: SettingCategory | null, version: number = 0) {
		super({} as T, category, version);
	}

	/**
	 * Registers a new option with the given key and value.
	 * @param key The key of the option. Must be unique, not contain ',' and shouldn't change in the future
	 * @param value The value of the option
	 * @param label The label of the option, displayed in the UI
	 * @param defaultStatus The default status of the option
	 * @throws InvalidArgumentException if the key contains ','
	 */
	option<K extends string, V>(key: K & Exclude<K, keyof T>, value: V, label: string, defaultStatus: boolean) {
		if (key.includes(",")) throw new InvalidArgumentException("Key cannot contain ','");
		(this.value as unknown as Record<K, Option<V>>)[key] = {value, label, status: defaultStatus};
		this.registry.broadcast(this.value); // Listeners need to be notified about new options
		return this as unknown as MultiSelectSetting<S | V, T & Record<K, Option<V>>>;
	}

	/**
	 * Checks if the option with the given key is selected.
	 * @param key The key of the option
	 * @returns true if the option is selected, false otherwise
	 */
	isSelected(key: keyof T) {
		if (!this.value[key]) return false; // Might not be initialized yet
		return this.value[key].status;
	}

	/**
	 * Selects the option with the given key.
	 * @param key The key of the option
	 * @param status The status to set
	 * @throws InvalidArgumentException if the option with the given key does not exist
	 */
	select(key: keyof T & string, status: boolean) {
		if (!this.value[key]) throw new InvalidArgumentException(`Option with key ${key} does not exist`);
		this.value[key].status = status;
		this.registry.broadcast(this.value);
		return this;
	}

	/**
	 * Returns the enabled options.
	 * @returns An array of the values of the enabled options
	 */
	getEnabledOptions(): S[] {
		return Object.keys(this.value).filter(key => this.value[key].status).map(key => this.value[key].value);
	}

	/**
	 * Returns all options.
	 * @returns An array of the values of all options
	 */
	getAllOptions(): S[] {
		return Object.keys(this.value).map(key => this.value[key].value);
	}

	toString() {
		return Object.keys(this.value).filter(key => this.value[key].status).join(",");
	}

	fromString(value: string) {
		const selected = value.split(",");
		for (const key in this.value) {
			this.value[key].status = selected.includes(key);
		}
		return this;
	}
}

type Option<T> = {
	value: T;
	label: string;
	status: boolean;
}