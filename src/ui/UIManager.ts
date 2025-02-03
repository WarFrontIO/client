import {UIElement} from "./UIElement";
import {InvalidArgumentException} from "../util/Exceptions";
import {getSetting, getSettingObject, registerSettingListener} from "../util/settings/UserSettingManager";
import {StaticUIRoot} from "./type/StaticUIRoot";

const index: Map<string, UIElement> = new Map();
const children: Map<string, Set<UIElement>> = new Map();
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
	children.set(name, new Set());
}

/**
 * Registers a child element.
 * This is needed to propagate events upwards.
 * @param child The child element
 * @throws InvalidArgumentException if the child element is not attached to a registered UI element
 */
export function registerChildElement(child: UIElement) {
	let current: HTMLElement | null = child.getElement();
	while (current && !index.has(current.id)) {
		current = current.parentElement;
	}
	if (!current) {
		throw new InvalidArgumentException("Child element is not attached to a registered UI element");
	}
	if (current !== child.getElement()) children.get(current.id)?.add(child);
}

/**
 * Hides a UI element.
 * @param name The name of the UI element
 */
export function showUIElement(name: string) {
	const element = index.get(name);
	if (element) {
		element.getElement().style.display = "";
		element.showListeners.broadcast();
		children.get(name)?.forEach(child => child.showListeners.broadcast());
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
		element.getElement().style.display = "none";
		element.hideListeners.broadcast();
		children.get(name)?.forEach(child => child.hideListeners.broadcast());
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

registerSettingListener("theme", theme => {
	if (getSettingObject("theme").isInitialized()) document.documentElement.classList.remove("theme-" + getSetting("theme").id);
	document.documentElement.classList.add("theme-" + theme.id);
});


/**
 * Loads a static UI element by its id.
 * @param id The id of the static UI element
 * @throws InvalidArgumentException if the id is not a valid static UI element
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function loadStaticElement(id: string) {
	const element = document.getElementById(id);
	if (!element) {
		throw new InvalidArgumentException(`Element with id ${id} is not a valid static UI element`);
	}
	element.style.position = "absolute";
	element.style.width = "100%";
	element.style.height = "100%";
	registerUIElement(id, new StaticUIRoot(element));
}

// The following lines are filled in by the build process
// BUILD_MODULE_REGISTER
// End of module register block