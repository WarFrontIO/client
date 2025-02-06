import {InteractionListeners, interactionManager, InteractionType} from "../event/InteractionManager";
import {resolveElement} from "./UIElement";
import {AssertionFailedException} from "../util/Exceptions";
import {SafeMap} from "../util/SafeMap";
import {getTopUIElement} from "./UIManager";

const subscribers: {
	[T in InteractionType]: Map<string, Omit<InteractionListeners[T], "test">>
} = {
	[InteractionType.CLICK]: new Map(),
	[InteractionType.DRAG]: new Map(),
	[InteractionType.SCROLL]: new Map(),
	[InteractionType.MULTITOUCH]: new Map(),
	[InteractionType.HOVER]: new Map(),
	[InteractionType.KEYBOARD]: new Map()
};
const keyDownMap: SafeMap<string, { keys: Set<string>, handler: (x: number, y: number) => void }[]> = new SafeMap(() => []);
const keyUpMap: SafeMap<string, { keys: Set<string>, handler: (x: number, y: number) => void }[]> = new SafeMap(() => []);

/**
 * Resolves the interaction listener for the given element.
 * Elements propagate up the DOM tree until a listener is found.
 * @param element The element to resolve the listener for
 * @param type The type of listener to resolve
 * @param keys The keys that are currently pressed, only defined for keyboard interactions
 */
export function resolveInteraction<T extends InteractionType>(element: HTMLElement | null, type: T, keys: Set<string> | undefined): { id: string, listener: Omit<InteractionListeners[T], "test"> } | null {
	if (!element || element.id === "" || !subscribers[type].has(element.id) || (type === InteractionType.KEYBOARD && keys && keyDownMap.getOrSet(element.id).every(k => [...k.keys].some(key => !keys.has(key))))) {
		if (element && element.parentElement) {
			return resolveInteraction(element.parentElement, type, keys);
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

function buildListener<T extends InteractionType>(type: T): InteractionListeners[T] {
	let handler: Omit<InteractionListeners[T], "test"> | undefined;
	return new Proxy({} as InteractionListeners[T], {
		get: (_, prop) => {
			if (prop === "test") {
				return (_x: number, _y: number, element: EventTarget | null, keys: Set<string> | undefined) => {
					if (type === InteractionType.KEYBOARD && element === document.body) {
						const topElement = getTopUIElement();
						if (topElement) element = topElement.getElement(); // Treat the top UI element as the target for keyboard events
					}
					handler = resolveInteraction(element as HTMLElement, type, keys)?.listener;
					return !!handler;
				};
			}
			return handler?.[prop as keyof Omit<InteractionListeners[T], "test">];
		}
	});
}

interactionManager.click.register(buildListener(InteractionType.CLICK));
interactionManager.drag.register(buildListener(InteractionType.DRAG));
interactionManager.scroll.register(buildListener(InteractionType.SCROLL));
interactionManager.multitouch.register(buildListener(InteractionType.MULTITOUCH));
interactionManager.hover.register(buildListener(InteractionType.HOVER));
interactionManager.keyboard.register(buildListener(InteractionType.KEYBOARD));

/**
 * Registers a click listener for a html element.
 * For non-UI elements {@link InteractionManager.click} should be used instead.
 * @param element The element to register the listener for
 * @param handler The handler to call when the element is clicked
 * @param bindKeyboard Whether to bind keyboard events to the element
 */
export function registerClickListener(element: HTMLElement | string, handler: (x: number, y: number) => void, bindKeyboard: boolean = true): void {
	subscribers[InteractionType.CLICK].set(resolveElement(element).id, {onClick: handler});
	if (bindKeyboard) {
		registerKeyboardListener(element, "Enter", handler);
		registerKeyboardListener(element, " ", handler);
	}
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
 * Registers a keyboard listener for a html element.
 * For non-UI elements {@link InteractionManager.keyboard} should be used instead.
 * @param element The element to register the listener for
 * @param keyDownHandler The handler to call when a key is pressed
 * @param keyUpHandler The handler to call when a key is released
 */
export function registerFullKeyboardListener(element: HTMLElement | string, keyDownHandler: (keys: Set<string>, x: number, y: number) => void, keyUpHandler: (key: string, x: number, y: number) => void): void {
	subscribers[InteractionType.KEYBOARD].set(resolveElement(element).id, {onKeyDown: keyDownHandler, onKeyUp: keyUpHandler});
}

/**
 * Registers a keyboard listener for a html element and specific key.
 * For non-UI elements {@link InteractionManager.keyboard} should be used instead.
 * For more complex keyboard interactions {@link registerFullKeyboardListener} should be used instead.
 * @param element The element to register the listener for
 * @param key The key to listen for, the first key in the array must be the primary key
 * @param handler The handler to call when a key is pressed
 * @param keyUpHandler The handler to call when a key is released
 */
export function registerKeyboardListener(element: HTMLElement | string, key: string | string[], handler: (x: number, y: number) => void, keyUpHandler?: (x: number, y: number) => void): void {
	const resolved = resolveElement(element);
	keyDownMap.getOrSet(resolved.id).push({keys: new Set(Array.isArray(key) ? key : [key]), handler});
	if (keyUpHandler) {
		keyUpMap.getOrSet(resolved.id).push({keys: new Set([Array.isArray(key) ? key[0] : key]), handler: keyUpHandler});
	}
	setDefaultKeyboardListener(resolved);
}

/**
 * Sets the default keyboard listener for an element.
 * This listener will allow registering per-key listeners.
 * @param resolved The element to set the default keyboard listener for
 */
function setDefaultKeyboardListener(resolved: HTMLElement): void {
	if (subscribers[InteractionType.KEYBOARD].has(resolved.id)) return;
	subscribers[InteractionType.KEYBOARD].set(resolved.id, {
		onKeyDown(keys: Set<string>, x: number, y: number): void {
			let specificity = 0;
			let match: ((x: number, y: number) => void) | null = null;
			for (const key of keyDownMap.getOrSet(resolved.id)) {
				if ([...key.keys].every(k => keys.has(k))) {
					if (key.keys.size > specificity) {
						specificity = key.keys.size;
						match = key.handler;
					}
				}
			}
			if (match) {
				match(x, y);
			}
		},
		onKeyUp: (key: string, x: number, y: number) => {
			keyUpMap.getOrSet(resolved.id).forEach(k => {
				if (k.keys.has(key)) {
					k.handler(x, y);
				}
			});
		}
	});
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
	subscribers[InteractionType.KEYBOARD].set(resolved.id, {onKeyDown: () => {}, onKeyUp: () => {}});
}

/**
 * Destroys the interaction listeners for the given element.
 * @param element The element to destroy the listeners for
 */
export function removeInteractionListeners(element: string): void {
	subscribers[InteractionType.CLICK].delete(element);
	subscribers[InteractionType.DRAG].delete(element);
	subscribers[InteractionType.SCROLL].delete(element);
	subscribers[InteractionType.MULTITOUCH].delete(element);
	subscribers[InteractionType.HOVER].delete(element);
	subscribers[InteractionType.KEYBOARD].delete(element);
	keyDownMap.delete(element);
	keyUpMap.delete(element);
}