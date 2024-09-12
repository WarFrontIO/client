import {ElementId, resolveElement, UIElement} from "../UIElement";
import {InvalidArgumentException} from "../../util/Exceptions";
import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";

/**
 * A validated input element.
 */
export class ValidatedInput extends UIElement {
	protected readonly element: HTMLInputElement;
	protected readonly errorElement: HTMLElement;
	private readonly rules: ((value: string) => boolean)[] = [];
	private readonly listeners: EventHandlerRegistry<[string, boolean]> = new EventHandlerRegistry();

	constructor(element: HTMLInputElement, errorElement: HTMLElement) {
		super(element);
		this.element.addEventListener("input", () => {
			const value = this.element.value;
			if (this.rules.every(rule => rule(value))) {
				this.element.setCustomValidity("");
				this.element.classList.remove("form-control-error");
				this.errorElement.style.display = "none";
			}
			this.listeners.broadcast(value, this.element.checkValidity());
		});
		this.element.addEventListener("invalid", () => {
			this.element.classList.add("form-control-error");
			this.errorElement.textContent = this.element.validationMessage;
			this.errorElement.style.display = "block";
		});
		this.errorElement = errorElement;
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
		this.listeners.register(callback);
		return this;
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