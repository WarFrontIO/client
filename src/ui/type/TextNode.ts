import {UIElement} from "../UIElement";

export class TextNode extends UIElement {
	/**
	 * Sets the text of the text node.
	 * @param text The text of the text node
	 */
	setText(text: string): this {
		this.element.textContent = text;
		return this;
	}
}

/**
 * Builds a text node.
 * @param text The text of the text node
 * @param classes The classes of the text node
 * @returns The text node
 */
export function buildTextNode(text: string, ...classes: string[]): TextNode {
	const element = document.createElement("span");
	element.classList.add(...classes);
	element.textContent = text;
	return new TextNode(element);
}

/**
 * Builds a header element.
 * @param text The text of the header
 * @param classes The classes of the header
 * @returns The header element
 */
export function buildMainHeader(text: string, ...classes: string[]): TextNode {
	const element = document.createElement("h1");
	element.classList.add(...classes);
	element.textContent = text;
	return new TextNode(element);
}

/**
 * Builds a sub-header element.
 * @param text The text of the sub-header
 * @param classes The classes of the sub-header
 * @returns The sub-header element
 */
export function buildSubHeader(text: string, ...classes: string[]): TextNode {
	const element = document.createElement("h2");
	element.classList.add(...classes);
	element.textContent = text;
	return new TextNode(element);
}

/**
 * Builds a section header element.
 * @param text The text of the section header
 * @param classes The classes of the section header
 * @returns The section header element
 */
export function buildSectionHeader(text: string, ...classes: string[]): TextNode {
	const element = document.createElement("h3");
	element.classList.add(...classes);
	element.textContent = text;
	return new TextNode(element);
}

/**
 * Builds a paragraph element.
 * @param text The text of the paragraph
 * @param classes The classes of the paragraph
 * @returns The paragraph element
 */
export function buildParagraph(text: string, ...classes: string[]): TextNode {
	const element = document.createElement("p");
	element.classList.add(...classes);
	element.textContent = text;
	return new TextNode(element);
}

/**
 * Builds an icon element.
 * @param icon The icon of the icon element
 * @param classes The classes of the icon element
 * @returns The icon element
 */
export function buildIcon(icon: string, ...classes: string[]): TextNode {
	const element = document.createElement("a");
	element.classList.add("icon-fixed", "icon-" + icon, ...classes);
	return new TextNode(element);
}