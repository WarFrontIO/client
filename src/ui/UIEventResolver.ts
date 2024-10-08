import {InteractionListeners, InteractionType} from "../event/InteractionManager";
import {resolveElement} from "./UIElement";
import {AssertionFailedException} from "../util/Exceptions";

const subscribers: {
	[T in InteractionType]: Map<string, Omit<InteractionListeners[T], "test">>
} = {
	[InteractionType.CLICK]: new Map(),
	[InteractionType.DRAG]: new Map(),
	[InteractionType.SCROLL]: new Map(),
	[InteractionType.MULTITOUCH]: new Map(),
	[InteractionType.HOVER]: new Map()
};

export function resolveInteraction(element: HTMLElement | null, type: InteractionType): { id: string, listener: Omit<InteractionListeners[InteractionType], "test"> } | null {
	if (!element || element.id === "" || !subscribers[type].has(element.id)) {
		if (element && element.parentElement) {
			return resolveInteraction(element.parentElement, type);
		}
		return null;
	}
	if ((element as HTMLButtonElement).disabled) {
		return null;
	}
	const listener = subscribers[type].get(element.id);
	if (!listener) {
		throw new AssertionFailedException(`Listener for element ${element.id} is null`);
	}
	return {id: element.id, listener};
}

/**
 * Registers a click listener for a html element.
 * For non-UI elements {@link InteractionManager.click} should be used instead.
 * @param element The element to register the listener for
 * @param handler The handler to call when the element is clicked
 */
export function registerClickListener(element: HTMLElement | string, handler: (x: number, y: number) => void): void {
	subscribers[InteractionType.CLICK].set(resolveElement(element).id, {onClick: handler});
}

/**
 * Registers a drag listener for a html element.
 * For non-UI elements {@link InteractionManager.drag} should be used instead.
 * @param element The element to register the listener for
 * @param startHandler The handler to call when the drag starts
 * @param moveHandler The handler to call when the element is dragged
 * @param endHandler The handler to call when the drag ends
 */
export function registerDragListener(element: HTMLElement | string, startHandler: (x: number, y: number) => void, moveHandler: (x: number, y: number, dx: number, dy: number) => void, endHandler: (x: number, y: number) => void): void {
	subscribers[InteractionType.DRAG].set(resolveElement(element).id, {onDragStart: startHandler, onDragMove: moveHandler, onDragEnd: endHandler});
}

/**
 * Registers a scroll listener for a html element.
 * For non-UI elements {@link InteractionManager.scroll} should be used instead.
 * @param element The element to register the listener for
 * @param handler The handler to call when the element is scrolled
 */
export function registerScrollListener(element: HTMLElement | string, handler: (x: number, y: number, delta: number) => void): void {
	subscribers[InteractionType.SCROLL].set(resolveElement(element).id, {onScroll: handler});
}

/**
 * Registers a multitouch listener for a html element.
 * For non-UI elements {@link InteractionManager.multitouch} should be used instead.
 * @param element The element to register the listener for
 * @param handler The handler to call when the element is multi-touched
 */
export function registerMultiTouchListener(element: HTMLElement | string, handler: (oldX: number, oldY: number, newX: number, newY: number, factor: number) => void): void {
	subscribers[InteractionType.MULTITOUCH].set(resolveElement(element).id, {onMultiTouch: handler});
}

/**
 * Registers a hover listener for a html element.
 * For non-UI elements {@link InteractionManager.hover} should be used instead.
 * @param element The element to register the listener for
 * @param handler The handler to call when the element is hovered
 */
export function registerHoverListener(element: HTMLElement | string, handler: (x: number, y: number) => void): void {
	subscribers[InteractionType.HOVER].set(resolveElement(element).id, {onHover: handler});
}

/**
 * Blocks interaction with the game behind the given element.
 * @param element The element to block interaction with
 */
export function blockInteraction(element: HTMLElement | string): void {
	const resolved = resolveElement(element);
	subscribers[InteractionType.CLICK].set(resolved.id, {onClick: () => {}});
	subscribers[InteractionType.DRAG].set(resolved.id, {onDragStart: () => {}, onDragMove: () => {}, onDragEnd: () => {}});
	subscribers[InteractionType.SCROLL].set(resolved.id, {onScroll: () => {}});
	subscribers[InteractionType.MULTITOUCH].set(resolved.id, {onMultiTouch: () => {}});
	subscribers[InteractionType.HOVER].set(resolved.id, {onHover: () => {}});
}