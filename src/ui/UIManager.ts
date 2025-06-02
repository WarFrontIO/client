import type {UIElement} from "./UIElement";
import {InvalidArgumentException} from "../util/Exceptions";
import {getSetting, getSettingObject, registerSettingListener} from "../util/settings/UserSettingManager";
import {ContentField} from "./type/ContentField";

const index: Map<string, UIElement> = new Map();
const openElements: Set<string> = new Set();

/**
 * Registers a UI element.
 * @param name The name of the UI element
 * @param element The UI element
 */
export function registerUIElement(name: string, element: UIElement) {
	if (index.has(name)) {
		throw new InvalidArgumentException(`UI element with name ${name} is already registered`);
	}
	index.set(name, element);
}

/**
 * Hides a UI element.
 * @param name The name of the UI element
 */
export function showUIElement(name: string) {
	const element = index.get(name);
	if (element) {
		if (openElements.has(name)) return;
		element.showListeners.broadcast();
		openElements.add(name);
	} else {
		console.warn(`UI element with name ${name} is not registered`);
	}
}

/**
 * Hides a UI element.
 * @param name The name of the UI element
 */
export function hideUIElement(name: string) {
	const element = index.get(name);
	if (element) {
		if (!openElements.has(name)) return;
		element.hideListeners.broadcast();
		openElements.delete(name);
	} else {
		console.warn(`UI element with name ${name} is not registered`);
	}
}

/**
 * Hides all UI elements.
 */
export function hideAllUIElements() {
	openElements.forEach(hideUIElement);
}

/**
 * Gets a UI element by its name.
 * @param name The name of the UI element
 * @returns The UI element
 * @throws InvalidArgumentException if the UI element is not registered
 */
export function getUIElement(name: string): UIElement {
	const element = index.get(name);
	if (!element) {
		throw new InvalidArgumentException(`UI element with name ${name} is not registered`);
	}
	return element;
}

/**
 * Gets the top UI element.
 * @returns The top UI element or null if none are open
 */
export function getTopUIElement(): UIElement | null {
	const element = Array.from(openElements).pop();
	return element ? getUIElement(element) : null;
}

registerSettingListener("theme", theme => {
	if (getSettingObject("theme").isInitialized()) document.documentElement.classList.remove("theme-" + getSetting("theme").id);
	document.documentElement.classList.add("theme-" + theme.id);
});


/**
 * Loads a static UI element by its id.
 * @param id The id of the static UI element
 * @throws InvalidArgumentException if the id is not a valid static UI element
 */
export function loadStaticElement(id: string) {
	const element = document.getElementById(id);
	if (!element) {
		throw new InvalidArgumentException(`Element with id ${id} is not a valid static UI element`);
	}
	element.style.position = "absolute";
	element.style.width = "100%";
	element.style.height = "100%";
	registerUIElement(id, new ContentField(element, element));
}