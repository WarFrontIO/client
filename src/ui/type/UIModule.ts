import {Anchor, UIElement} from "../UIElement";
import {getUIElement, registerUIElement} from "../UIManager";

/**
 * A UI module is a collection of UI elements that are grouped together.
 * These are used to create pages e.g. the in-game controls from multiple separate UI elements.
 */
export class UIModule extends UIElement {
	/**
	 * Adds a child element to this module at the given position.
	 * This positions the child element at the given anchor relative to this module.
	 * Note, that if an element is already attached to the given anchor, they will overlap.
	 * @param child The child element to attach
	 * @param anchor The anchor of the child element
	 */
	add(child: UIElement, anchor: Anchor): this {
		const className = "anchor-" + Anchor[anchor].toLowerCase().replace("_", "-");
		child.getElement().style.display = "block"; // Module children are visible by default
		child.getElement().classList.add(className);
		this.getElement().appendChild(child.getElement());
		return this;
	}

	/**
	 * Adds a named child element to this module at the given position.
	 * This positions the child element at the given anchor relative to this module.
	 * Note, that if an element is already attached to the given anchor, they will overlap.
	 * @param child The name of the child element to attach
	 * @param anchor The anchor of the child element
	 * @throws InvalidArgumentException if the child element is not registered
	 */
	addNamed(child: string, anchor: Anchor): this {
		return this.add(getUIElement(child), anchor);
	}
}

/**
 * Builds a UI module.
 * @param name The name of the module
 * @param classes The classes to add to the module
 * @returns The UI module
 */
export function buildModule(name: string, classes: string[]) {
	const element = document.createElement("div");
	element.id = name;
	element.classList.add(...classes);
	element.style.display = "none";
	element.style.position = "relative";
	document.body.appendChild(element);
	const module = new UIModule(element);
	registerUIElement(name, module);
	return module;
}