import {Setting, SettingCategory} from "./Setting";

export class StringSetting extends Setting<string> {
	readonly type = "string";
	protected initialized: boolean = true;
	protected readonly mutators: ((value: string) => string)[] = [];
	protected readonly rules: { errorMessage: string, rule: (value: string) => boolean }[] = [];

	static asAddress(defaultValue: string, category: SettingCategory | null, version: number = 0) {
		const isUrl = (value: string) => {
			try {
				const url = new URL(value);
				return ["http:", "https:", "ws:", "wss:"].includes(url.protocol) && (url.hostname === "localhost" || url.hostname.includes("."));
			} catch {
				return false;
			}
		};

		return new StringSetting(defaultValue, category, version)
			.mutate(value => value.trim().toLowerCase())
			.mutate(value => !isUrl(value) && isUrl(`https://${value}`) ? `https://${value}` : value)
			.addRule("Invalid address", value => isUrl(value));
	}

	/**
	 * Adds a mutator to the input element.
	 * Mutators are applied in the order they are added.
	 * @param mutator The mutator to add
	 */
	mutate(mutator: (value: string) => string): this {
		this.mutators.push(mutator);
		return this;
	}

	/**
	 * Adds a validation rule to the input element.
	 * @param errorMessage The error message to display if the rule fails
	 * @param rule The validation rule
	 */
	addRule(errorMessage: string, rule: (value: string) => boolean): this {
		this.rules.push({errorMessage, rule});
		return this;
	}

	/**
	 * @returns The mutators of this input element
	 */
	getMutators(): ((value: string) => string)[] {
		return this.mutators;
	}

	/**
	 * @returns The validation rules of this input element
	 */
	getRules(): { errorMessage: string, rule: (value: string) => boolean }[] {
		return this.rules;
	}

	toString(): string {
		return this.value;
	}

	fromString(value: string): void {
		this.value = value;
	}
}