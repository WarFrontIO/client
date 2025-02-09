import {UIElement} from "../UIElement";
import {buildTooltipContainer, TooltipContainer} from "./TooltipContainer";

export class CopyableTextContainer extends UIElement {
	protected readonly titleElement: HTMLElement;
	protected readonly contentElement: HTMLElement;
	protected readonly tooltipContainer: TooltipContainer;

	constructor(element: HTMLElement, titleElement: HTMLElement, contentElement: HTMLElement) {
		super(element);
		this.titleElement = titleElement;
		this.contentElement = contentElement;
		this.tooltipContainer = buildTooltipContainer(this.contentElement);
		contentElement.addEventListener("click", () => this.copy());
	}

	/**
	 * Sets the title of this copyable text container.
	 * @param title The title to set
	 */
	setTitle(title: string): this {
		this.titleElement.innerText = title;
		return this;
	}

	/**
	 * Sets the content of this copyable text container.
	 * @param content The content to set
	 */
	setContent(content: string): this {
		this.contentElement.innerText = content;
		return this;
	}

	/**
	 * Copies the content of this copyable text container to the clipboard.
	 */
	copy(): this {
		navigator.clipboard.writeText(this.contentElement.childNodes[0].textContent ?? "")
			.then(() => this.tooltipContainer.showTemporaryTooltip("Copied!", "success", 1000))
			.catch((e) => {
				console.error(e);
				this.tooltipContainer.showTemporaryTooltip("Failed to copy :c", "danger", 2000);
			});
		return this;
	}
}

/**
 * Builds a copyable text container.
 * @param title The title of the copyable text container
 * @param content The content of the copyable text container
 * @param titleClasses The classes of the title
 * @param contentClasses The classes of the content
 * @returns The copyable text container
 */
export function buildCopyableTextContainer(title: string, content: string, titleClasses: string[] = [], contentClasses: string[] = []): CopyableTextContainer {
	const element = document.createElement("span");
	const titleElement = document.createElement("span");
	titleElement.classList.add(...titleClasses);
	titleElement.textContent = title;
	element.appendChild(titleElement);

	const contentElement = document.createElement("span");
	contentElement.classList.add(...contentClasses);
	contentElement.textContent = content;
	element.appendChild(contentElement);

	return new CopyableTextContainer(element, titleElement, contentElement);
}