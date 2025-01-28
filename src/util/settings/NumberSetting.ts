import {Setting} from "./Setting";

export class NumberSetting extends Setting<number> {
	readonly type = "number";
	protected initialized: boolean = true;

	toString(): string {
		return this.value.toString();
	}

	fromString(value: string): void {
		this.value = parseFloat(value);
	}
}
