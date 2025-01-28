import {ElementId, resolveElement, UIElement} from "../UIElement";
import {InvalidArgumentException} from "../../util/Exceptions";
import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";
import {registerSettingListener, SettingKeyOf, updateSetting} from "../../util/UserSettingManager";

/**
 * A validated input element.
 */
export class ValidatedInput extends UIElement {
	protected readonly element: HTMLInputElement;
	protected readonly errorElement: HTMLElement;
	private readonly mutators: ((value: string) => string)[] = [];
	private readonly rules: ((value: string) => boolean)[] = [];
	private readonly inputListeners: EventHandlerRegistry<[string, boolean]> = new EventHandlerRegistry();
	private readonly blurListeners: EventHandlerRegistry<[string, boolean]> = new EventHandlerRegistry();

	constructor(element: HTMLInputElement, errorElement: HTMLElement) {
		super(element);
		this.element.addEventListener("input", () => this.validate());
		this.element.addEventListener("blur", () => {
			const value = this.mutators.reduce((value, mutator) => mutator(value), this.element.value);
			this.blurListeners.broadcast(value, this.element.checkValidity());
		});
		this.element.addEventListener("invalid", () => {
			this.element.classList.add("form-control-error");
			this.errorElement.textContent = this.element.validationMessage;
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
				this.element.setCustomValidity(errorMessage);
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
		const value = this.mutators.reduce((value, mutator) => mutator(value), this.element.value);
		if (this.rules.every(rule => rule(value))) {
			this.element.setCustomValidity("");
			this.element.classList.remove("form-control-error");
			this.errorElement.style.display = "none";
		}
		this.inputListeners.broadcast(value, this.element.checkValidity());
	}

	/**
	 * Links the input element to a setting.
	 * @param setting The setting
	 */
	linkSetting(setting: SettingKeyOf<string>): void {
		registerSettingListener(setting, value => this.element.value = value, true);
		this.validate();
		this.onBlur(value => updateSetting(setting, value)); //We save even if the value is invalid
	}
}

/**
 * Builds a validated input element.
 * @param id The id of the input element
 * @param errorId The id of the error element
 * @returns The validated input element
 * @throws InvalidArgumentException if the element is not an input element
 */
export function buildValidatedInput(id: ElementId, errorId: ElementId): ValidatedInput {
	const element = resolveElement(id);
	if (!(element instanceof HTMLInputElement)) {
		throw new InvalidArgumentException("Element must be an input element");
	}
	return new ValidatedInput(element, resolveElement(errorId));
}