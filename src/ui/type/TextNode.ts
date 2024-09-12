import {UIElement} from "../UIElement";

export class TextNode extends UIElement {
	/**
	 * Creates a new text node.
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
 * @returns The text node
 */
export function buildTextNode(text: string): TextNode {
	const element = document.createElement("span");
	element.textContent = text;
	return new TextNode(element);
}