import {UIElement} from "../UIElement";
import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";
import {registerSettingListener, SettingKeyOf, updateSetting} from "../../util/settings/UserSettingManager";

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
	linkSetting(setting: SettingKeyOf<boolean>): this {
		registerSettingListener(setting, value => this.inputElement.checked = value);
		this.onChanged(value => updateSetting(setting, value));
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