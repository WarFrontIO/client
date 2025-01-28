import {Setting} from "./Setting";

export class StringSetting extends Setting<string> {
	readonly type = "string";
	protected initialized: boolean = true;

	toString(): string {
		return this.value;
	}

	fromString(value: string): void {
		this.value = value;
	}
}