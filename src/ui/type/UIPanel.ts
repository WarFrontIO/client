import {UIElement} from "../UIElement";
import {blockInteraction, registerClickListener} from "../UIEventResolver";
import {hideUIElement, registerUIElement, showUIElement} from "../UIManager";

/**
 * A panel element.
 */
export class UIPanel extends UIElement {
	protected readonly bodyElement: HTMLElement;
	protected readonly titleElement: HTMLElement;
	protected closeHandler: () => void = () => {};

	constructor(element: HTMLElement, bodyElement: HTMLElement, titleElement: HTMLElement) {
		super(element);
		this.bodyElement = bodyElement;
		this.titleElement = titleElement;
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
	 * Sets the content of this panel.
	 * @param content The content to set
	 */
	setContent(...content: UIElement[]): this {
		this.bodyElement.replaceChildren(...content.map(child => child.getElement()));
		return this;
	}

	/**
	 * Sets the title of this panel.
	 * @param title The title to set
	 */
	setTitle(title: string): this {
		this.titleElement.textContent = title;
		return this;
	}

	/**
	 * Sets the close handler of this panel.
	 * @param handler The close handler
	 */
	setCloseHandler(handler: () => void): this {
		this.closeHandler = handler;
		return this;
	}

	/**
	 * Gets the close handler of this panel.
	 * @returns The close handler
	 */
	getCloseHandler(): () => void {
		return this.closeHandler;
	}
}

/**
 * Builds a panel element.
 * Where applicable use {@link showPanel} instead.
 * @param name The name of the panel
 * @returns The panel element
 */
export function buildPanel(name: string) {
	const outer = document.createElement("div");
	outer.id = name;
	outer.classList.add("layout-window", "flex-centered", "background-blur");
	outer.style.zIndex = "100";
	outer.style.display = "none";

	const inner = document.createElement("div");
	inner.classList.add("panel", "w-100");
	inner.style.maxWidth = "960px";

	const close = document.createElement("a");
	close.classList.add("icon-fixed", "icon-close");
	close.id = name + "Close";
	inner.appendChild(close);

	const titleElement = document.createElement("h2");
	titleElement.classList.add("panel-header");
	inner.appendChild(titleElement);

	const body = document.createElement("div");
	body.classList.add("panel-body");
	inner.appendChild(body);

	outer.appendChild(inner);
	document.body.appendChild(outer);

	const panel = new UIPanel(outer, body, titleElement);
	registerClickListener(close, () => panel.getCloseHandler()());
	blockInteraction(outer);
	registerUIElement(name, panel);
	return panel;
}

const defaultPanel = buildPanel("defaultPanel");

/**
 * Shows a panel with the given title and content.
 * @param title The title of the panel
 * @param content The content of the panel
 */
export function showPanel(title: string, ...content: UIElement[]): UIPanel {
	defaultPanel.setTitle(title).setContent(...content);
	showUIElement("defaultPanel");
	defaultPanel.setCloseHandler(() => hidePanel());
	return defaultPanel;
}

/**
 * Updates the content of the default panel.
 * @param content The content to set
 */
export function updatePanel(...content: UIElement[]) {
	defaultPanel.setContent(...content);
}

/**
 * Hides the default panel.
 */
export function hidePanel() {
	hideUIElement("defaultPanel");
}