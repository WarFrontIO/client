import {UIElement} from "../UIElement";
import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";
import {Setting} from "../../util/settings/Setting";
import {MultiSelectSetting, Option} from "../../util/settings/MultiSelectSetting";

export class CheckboxInput extends UIElement {
	private readonly inputElement: HTMLInputElement;
	private readonly changeListeners: EventHandlerRegistry<[boolean]> = new EventHandlerRegistry();

	constructor(element: HTMLElement, inputElement: HTMLInputElement) {
		super(element);
		inputElement.addEventListener("change", () => {
			this.changeListeners.broadcast(this.inputElement.checked);
		});
		this.inputElement = inputElement;
	}

	/**
	 * Returns whether the checkbox is checked.
	 * @param callback
	 */
	onChanged(callback: (checked: boolean) => void): this {
		this.changeListeners.register(callback);
		return this;
	}

	/**
	 * Links the checkbox to a setting.
	 * @param setting The setting
	 */
	linkSetting(setting: Setting<boolean>): this {
		this.handleRegistry(setting.getRegistry(), value => this.setChecked(value));
		this.onChanged(value => setting.set(value).save());
		return this;
	}

	/**
	 * Links the checkbox to a multi-select setting.
	 * @param setting The multi-select setting
	 * @param key The key of the option to link
	 */
	linkMultiSetting<T extends string>(setting: MultiSelectSetting<unknown, { [K in T]: Option<unknown> }>, key: T): this {
		this.handleRegistry(setting.getRegistry(), (_, obj) => this.setChecked(obj.isSelected(key)));
		this.onChanged(checked => setting.select(key, checked).save());
		return this;
	}
}

/**
 * Builds a checkbox input element.
 * @param description The description of the checkbox input element
 * @returns The checkbox input element
 */
export function buildCheckboxInput(description: string): CheckboxInput {
	const div = document.createElement("div");
	const label = document.createElement("label");
	label.classList.add("switch");

	const input = document.createElement("input");
	input.type = "checkbox";
	label.appendChild(input);

	const slider = document.createElement("span");
	slider.classList.add("slider", "slider-round");
	label.appendChild(slider);
	div.appendChild(label);
	div.appendChild(document.createTextNode(description));

	return new CheckboxInput(div, input);
}