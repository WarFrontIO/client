import {Anchor, Attachment, UIElement} from "../UIElement";

export class ContentField extends UIElement {
	protected readonly bodyElement: HTMLElement;

	constructor(element: HTMLElement, bodyElement: HTMLElement) {
		super(element);
		this.bodyElement = bodyElement;
	}

	/**
	 * Adds a child element to this panel.
	 * @param child The child element to add
	 */
	add(child: UIElement): this {
		this.bodyElement.appendChild(child.getElement());
		return this;
	}

	/**
	 * Adds a child element to this module at the given position.
	 * This positions the child element at the given anchor relative to this module.
	 * Note, that if an element is already attached to the given anchor, they will overlap.
	 * @param child The child element to attach
	 * @param anchor The anchor of the child element
	 */
	anchor(child: UIElement, anchor: Anchor): this {
		child.getElement().classList.add("anchor-" + Anchor[anchor].toLowerCase().replace("_", "-"));
		return this.add(child);
	}

	/**
	 * Attaches the given child element to this element.
	 * This aligns the child element to the given attachment relative to this element.
	 * Note that the attachment is relative to the parent element.
	 * Also note, that if an element is already attached to the given attachment, they will overlap.
	 * @param child The child element to attach
	 * @param attachment The attachment of the child element
	 */
	attach(child: UIElement, attachment: Attachment): this {
		const className = "attach-" + Attachment[attachment].toLowerCase();
		child.getElement().classList.add(className);
		return this.add(child);
	}

	/**
	 * Sets the content of this panel.
	 * @param content The content to set
	 */
	setContent(...content: UIElement[]): this {
		this.bodyElement.replaceChildren(...content.map(child => child.getElement()));
		return this;
	}

	/**
	 * Adds a class to the body of this panel.
	 * @param classes The classes
	 * @returns This panel
	 */
	addBodyClass(...classes: string[]): this {
		this.bodyElement.classList.add(...classes);
		return this;
	}
}

/**
 * Builds a content field.
 * @param type The type of the content field, used for styling
 * @param content The content of the content field
 * @returns The content field
 */
export function buildContentField(type: "primary" | "secondary" | "danger" | "success", ...content: UIElement[]): ContentField {
	const element = document.createElement("div");
	element.classList.add("content-field", "content-field-" + type);
	const field = new ContentField(element, element);
	field.setContent(...content);
	return field;
}

/**
 * Builds a container.
 * @param classes The classes of the container
 * @returns The container
 */
export function buildContainer(...classes: string[]): ContentField {
	const element = document.createElement("div");
	element.classList.add(...classes);
	return new ContentField(element, element);
}