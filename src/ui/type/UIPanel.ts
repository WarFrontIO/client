import type {UIElement} from "../UIElement";
import {blockInteraction, registerClickListener} from "../UIEventResolver";
import {hideUIElement, registerUIElement, showUIElement} from "../UIManager";
import {ContentField} from "./ContentField";

/**
 * A panel element.
 */
export class UIPanel extends ContentField {
	protected override readonly element: HTMLDialogElement;
	protected readonly titleElement: HTMLElement;
	protected closeHandler: () => void = () => {};

	constructor(element: HTMLElement, bodyElement: HTMLElement, titleElement: HTMLElement) {
		super(element, bodyElement);
		this.titleElement = titleElement;
	}

	override initDefaultListeners() {
		this.showListeners.register(() => this.element.showModal());
		this.hideListeners.register(() => this.element.close());
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
	const outer = document.createElement("dialog");
	outer.id = name;
	outer.classList.add("layout-window", "flex-centered", "background-blur");
	outer.style.zIndex = "100";

	const inner = document.createElement("div");
	inner.classList.add("panel", "w-100");
	inner.style.maxWidth = "960px";

	const close = document.createElement("a");
	close.classList.add("icon-fixed", "icon-close");
	close.id = name + "Close";
	close.tabIndex = 0;
	close.autofocus = true;
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
	registerUIElement(name, panel);
	panel.setCloseHandler(() => hideUIElement(name));
	outer.addEventListener("cancel", event => {
		event.preventDefault();
		panel.getCloseHandler()();
	});
	registerClickListener(close, () => panel.getCloseHandler()());
	blockInteraction(outer);
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