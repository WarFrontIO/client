import {InvalidArgumentException} from "../util/Exceptions";
import {EventHandlerRegistry} from "../event/EventHandlerRegistry";
import {registerChildElement} from "./UIManager";

export abstract class UIElement {
	protected readonly element: HTMLElement;
	readonly showListeners: EventHandlerRegistry<[]> = new EventHandlerRegistry();
	readonly hideListeners: EventHandlerRegistry<[]> = new EventHandlerRegistry();

	/**
	 * Creates a new UI element.
	 * @param element The HTML element of the UI element
	 */
	constructor(element: ElementId) {
		this.element = resolveElement(element);
	}

	/**
	 * Gets the HTML element of this UI element.
	 * @returns The HTML element of this UI element
	 */
	getElement(): HTMLElement {
		return this.element;
	}

	/**
	 * Adds a listener for the show event.
	 * @param callback The callback to invoke when the show event is triggered
	 */
	onShow(callback: () => void): this {
		this.makeResolvable();
		this.showListeners.register(callback);
		registerChildElement(this);
		return this;
	}

	/**
	 * Makes this UI element resolvable.
	 */
	protected makeResolvable() {
		if (this.element.id === "") {
			this.element.id = `element-${Math.random().toString(36).substring(2, 15)}`;
		}
	}
}

export enum Attachment {
	NORTH,
	EAST,
	SOUTH,
	WEST
}

export enum Anchor {
	TOP_LEFT,
	TOP_CENTER,
	TOP_RIGHT,
	MIDDLE_LEFT,
	MIDDLE_CENTER,
	MIDDLE_RIGHT,
	BOTTOM_LEFT,
	BOTTOM_CENTER,
	BOTTOM_RIGHT
}

export function resolveElement(element: ElementId): HTMLElement {
	if (element instanceof HTMLElement) {
		return element;
	}
	const resolved = document.getElementById(element);
	if (!resolved) {
		throw new InvalidArgumentException(`Element with id ${element} not found`);
	}
	return resolved;
}

export type ElementId = HTMLElement | string;