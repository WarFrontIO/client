import {InvalidArgumentException} from "../Exceptions";
import {ManagedSetting} from "./ManagedSetting";

export class MultiSelectSetting<T extends Record<string, Option<unknown>>> implements ManagedSetting {
	private options: T = {} as T;

	static init() {
		return new MultiSelectSetting<{}>();
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
		(this.options as unknown as Record<K, Option<V>>)[key] = {value, label, status: defaultStatus};
		return this as unknown as MultiSelectSetting<T & Record<K, Option<V>>>;
	}

	/**
	 * Checks if the option with the given key is selected.
	 * @param key The key of the option
	 * @returns true if the option is selected, false otherwise
	 */
	isSelected(key: keyof T) {
		return this.options[key].status;
	}

	/**
	 * Selects the option with the given key.
	 * @param key The key of the option
	 * @param status The status to set
	 */
	select(key: keyof T, status: boolean) {
		this.options[key].status = status;
	}

	/**
	 * Returns the enabled options.
	 * @returns An array of the values of the enabled options
	 */
	getEnabledOptions(): AnyValue<T>[] {
		return Object.keys(this.options).filter(key => this.options[key].status).map(key => this.options[key].value);
	}

	/**
	 * Returns all options.
	 * @returns An array of the values of all options
	 */
	getAllOptions(): AnyValue<T>[] {
		return Object.keys(this.options).map(key => this.options[key].value);
	}

	toString() {
		return Object.keys(this.options).filter(key => this.options[key].status).join(",");
	}

	fromString(value: string) {
		const selected = value.split(",");
		for (const key in this.options) {
			this.options[key].status = selected.includes(key);
		}
		return this;
	}
}

type Option<T> = {
	value: T;
	label: string;
	status: boolean;
}

type AnyValue<T extends Record<string, Option<unknown>>> = {
	[K in keyof T]: T[K]["value"];
}[keyof T];