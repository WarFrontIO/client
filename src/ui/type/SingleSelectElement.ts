import {UIElement} from "../UIElement";
import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";
import {SingleSelectSetting} from "../../util/settings/SingleSelectSetting";

/**
 * A select element that allows to select a single option.
 * This displays a custom menu when clicked or otherwise the default browser select.
 */
export class SingleSelectElement extends UIElement {
	protected readonly select: HTMLSelectElement;
	protected readonly changeListeners: EventHandlerRegistry<[string]> = new EventHandlerRegistry();

	constructor(element: HTMLElement, select: HTMLSelectElement) {
		super(element);
		select.addEventListener("change", () => this.changeListeners.broadcast(select.value));
		this.select = select;
	}

	/**
	 * Adds an option to the select element.
	 * @param value The value of the option
	 * @param text The text of the option
	 */
	addOption(value: string, text: string): this {
		const option = document.createElement("option");
		option.value = value;
		option.text = text;
		this.select.add(option);
		return this;
	}

	/**
	 * Sets the value of the select element.
	 * @param value The value to set
	 */
	setValue(value: string): this {
		this.select.value = value;
		return this;
	}

	/**
	 * Gets the value of the select element.
	 * @returns The value of the select element
	 */
	getValue(): string {
		return this.select.value;
	}

	/**
	 * Adds a change listener to the select element.
	 * @param callback The callback to invoke when the value changes
	 */
	onChanged(callback: (value: string) => void): this {
		this.changeListeners.register(callback);
		return this;
	}

	/**
	 * Links the single select element to a setting.
	 * @param setting The setting to link
	 */
	linkSetting(setting: SingleSelectSetting<unknown>): this {
		this.handleRegistry(setting.getRegistry(), (_, obj) => this.setValue(obj.getSelectedOption()));
		this.handleRegistry(setting.getOptionRegistry(), option => this.addOption(option, option));
		this.onChanged(value => setting.select(value).save());
		return this;
	}
}

/**
 * Builds a single select element.
 * @param description The description of the single select element
 * @returns The single select element
 */
export function buildSingleSelect(description: string): SingleSelectElement {
	const div = document.createElement("div");
	const select = document.createElement("select");
	select.classList.add("single-select");
	div.appendChild(select);
	div.appendChild(document.createTextNode(description));

	return new SingleSelectElement(div, select);
}