import {ElementId, resolveElement, UIElement} from "../UIElement";
import {InvalidArgumentException} from "../../util/Exceptions";
import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";
import {StringSetting} from "../../util/settings/StringSetting";

/**
 * A validated input element.
 */
export class ValidatedInput extends UIElement {
	protected readonly input: HTMLInputElement;
	protected readonly errorElement: HTMLElement;
	private readonly mutators: ((value: string) => string)[] = [];
	private readonly rules: ((value: string) => boolean)[] = [];
	private readonly inputListeners: EventHandlerRegistry<[string, boolean]> = new EventHandlerRegistry();
	private readonly blurListeners: EventHandlerRegistry<[string, boolean]> = new EventHandlerRegistry();

	constructor(element: HTMLElement, input: HTMLInputElement, errorElement: HTMLElement) {
		super(element);
		this.input = input;
		this.input.addEventListener("input", () => this.validate());
		this.input.addEventListener("blur", () => {
			const value = this.mutators.reduce((value, mutator) => mutator(value), this.input.value);
			this.blurListeners.broadcast(value, this.input.checkValidity());
		});
		this.input.addEventListener("invalid", () => {
			this.input.classList.add("form-control-error");
			this.errorElement.textContent = this.input.validationMessage;
			this.errorElement.style.display = "block";
		});
		this.errorElement = errorElement;
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
		this.rules.push((value: string) => {
			if (!rule(value)) {
				this.input.setCustomValidity(errorMessage);
				return false;
			}
			return true;
		});
		return this;
	}

	/**
	 * Adds a listener for the input event.
	 * @param callback The callback to invoke when the input event is triggered
	 */
	onInput(callback: (value: string, valid: boolean) => void): this {
		this.inputListeners.register(callback);
		return this;
	}

	/**
	 * Adds a listener for the blur event.
	 * @param callback The callback to invoke when the blur event is triggered
	 */
	onBlur(callback: (value: string, valid: boolean) => void): this {
		this.blurListeners.register(callback);
		return this;
	}

	/**
	 * Validates the input element.
	 */
	validate(): void {
		const value = this.mutators.reduce((value, mutator) => mutator(value), this.input.value);
		if (this.rules.every(rule => rule(value))) {
			this.input.setCustomValidity("");
			this.input.classList.remove("form-control-error");
			this.errorElement.style.display = "none";
		}
		this.inputListeners.broadcast(value, this.input.checkValidity());
	}

	/**
	 * Links the input element to a setting.
	 * @param setting The setting
	 * @param resetOnInvalid Whether to reset the setting to its default value if the input is invalid
	 */
	linkSetting(setting: StringSetting, resetOnInvalid: boolean = true): this {
		this.handleRegistry(setting.getRegistry(), value => this.input.value = value);
		this.onBlur((value, valid) => {
			if (valid || !resetOnInvalid) {
				setting.set(value).save();
			} else {
				setting.set(setting.getDefaultValue()).save();
				this.validate();
			}
		});
		for (const mutator of setting.getMutators()) {
			this.mutate(mutator);
		}
		for (const rule of setting.getRules()) {
			this.addRule(rule.errorMessage, rule.rule);
		}
		this.validate();
		return this;
	}
}

/**
 * Loads a validated input element.
 * @param id The id of the input element
 * @param errorId The id of the error element
 * @returns The validated input element
 * @throws InvalidArgumentException if the element is not an input element
 */
export function loadValidatedInput(id: ElementId, errorId: ElementId): ValidatedInput {
	const element = resolveElement(id);
	if (!(element instanceof HTMLInputElement)) {
		throw new InvalidArgumentException("Element must be an input element");
	}
	return new ValidatedInput(element, element, resolveElement(errorId));
}

/**
 * Builds a validated input element.
 * @param placeholder The placeholder of the input element
 * @param description The description of the input element
 * @returns The validated input element
 */
export function buildValidatedInput(placeholder: string, description: string): ValidatedInput {
	const div = document.createElement("div");

	const label = document.createElement("label");
	const input = document.createElement("input");
	input.classList.add("form-control", "mr-1");
	input.placeholder = placeholder;
	label.appendChild(input);
	label.appendChild(document.createTextNode(description));
	div.appendChild(label);

	const error = document.createElement("span");
	error.classList.add("form-label", "form-label-danger");
	div.appendChild(error);

	return new ValidatedInput(div, input, error);
}