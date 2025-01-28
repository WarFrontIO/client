import {Setting} from "./Setting";

export class IntegerSetting extends Setting<number> {
	readonly type = "integer";
	protected initialized: boolean = true;

	toString(): string {
		return this.value.toString();
	}

	fromString(value: string): void {
		this.value = parseInt(value);
	}
}