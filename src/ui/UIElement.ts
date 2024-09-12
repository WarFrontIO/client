import {InvalidArgumentException} from "../util/Exceptions";

export abstract class UIElement {
	protected readonly element: HTMLElement;

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
		return element
	}
	const resolved = document.getElementById(element);
	if (!resolved) {
		throw new InvalidArgumentException(`Element with id ${element} not found`);
	}
	return resolved;
}

export type ElementId = HTMLElement | string;