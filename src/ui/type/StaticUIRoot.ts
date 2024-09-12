import {Attachment, UIElement} from "../UIElement";

/**
 * Every UI element that was defined in the ui/elements folder is considered static. (These can contain any type of generic HTML elements)
 * Can also be used to integrate ui elements that were created using the DOM API with the ui system.
 */
export class StaticUIRoot extends UIElement {
	protected readonly element: HTMLDivElement;

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
		this.element.appendChild(child.getElement());
		return this;
	}
}