import {InvalidArgumentException} from "../util/Exceptions";
import {EventHandlerRegistry} from "../event/EventHandlerRegistry";
import {registerClickListener, registerDragListener, registerHoverListener, registerMultiTouchListener, registerScrollListener} from "./UIEventResolver";
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
		this.initDefaultListeners();
	}

	protected initDefaultListeners() {
		this.showListeners.register(() => this.element.style.display = "");
		this.hideListeners.register(() => this.element.style.display = "none");
	}

	/**
	 * Gets the HTML element of this UI element.
	 * @returns The HTML element of this UI element
	 */
	getElement(): HTMLElement {
		return this.element;
	}

	/**
	 * Sets the text content of this UI element.
	 * @param name The attribute name
	 * @param value The value to set
	 */
	setAttribute(name: string, value: string): this {
		this.element.setAttribute(name, value);
		return this;
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
	 * Adds a click listener to this UI element.
	 * @param callback The callback to invoke when the element is clicked
	 */
	onClick(callback: (x: number, y: number) => void): this {
		this.makeResolvable();
		registerClickListener(this.element, callback);
		return this;
	}

	/**
	 * Adds a drag listener to this UI element.
	 * @param startHandler The handler to call when the drag starts
	 * @param moveHandler The handler to call when the element is dragged
	 * @param endHandler The handler to call when the drag ends
	 */
	onDrag(startHandler: (x: number, y: number) => void, moveHandler: (x: number, y: number, dx: number, dy: number) => void, endHandler: (x: number, y: number) => void): this {
		this.makeResolvable();
		registerDragListener(this.element, startHandler, moveHandler, endHandler);
		return this;
	}

	/**
	 * Adds a scroll listener to this UI element.
	 * @param callback The callback to invoke when the element is scrolled
	 */
	onScroll(callback: (x: number, y: number, delta: number) => void): this {
		this.makeResolvable();
		registerScrollListener(this.element, callback);
		return this;
	}

	/**
	 * Adds a multitouch listener to this UI element.
	 * @param callback The callback to invoke when the element is multi-touched
	 */
	onMultiTouch(callback: (oldX: number, oldY: number, newX: number, newY: number, factor: number) => void): this {
		this.makeResolvable();
		registerMultiTouchListener(this.element, callback);
		return this;
	}

	/**
	 * Adds a hover listener to this UI element.
	 * @param callback The callback to invoke when the element is hovered
	 */
	onHover(callback: (x: number, y: number) => void): this {
		this.makeResolvable();
		registerHoverListener(this.element, callback);
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