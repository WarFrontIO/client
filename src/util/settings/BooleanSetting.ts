import {Setting} from "./Setting";

export class BooleanSetting extends Setting<boolean> {
	readonly type = "boolean";
	protected override initialized: boolean = true;

	toString(): string {
		return this.value.toString();
	}

	fromString(value: string): void {
		this.value = value === "true";
	}
}