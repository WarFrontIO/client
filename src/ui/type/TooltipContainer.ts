import {UIElement} from "../UIElement";

export class TooltipContainer extends UIElement {
	private tooltipElement: HTMLElement | null = null;
	private tooltipTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Adds a tooltip to the container.
	 * @param text The text of the tooltip
	 * @param type The type of the tooltip
	 */
	showTooltip(text: string, type: "primary" | "secondary" | "danger" | "success"): this {
		if (this.tooltipElement) {
			this.element.removeChild(this.tooltipElement);
		}
		const tooltip = document.createElement("div");
		tooltip.classList.add("tooltip", "tooltip-" + type);
		tooltip.textContent = text;
		this.tooltipElement = tooltip;
		this.element.appendChild(tooltip);
		return this;
	}

	/**
	 * Adds a temporary tooltip to the container.
	 * @param text The text of the tooltip
	 * @param type The type of the tooltip
	 * @param duration The duration of the tooltip
	 */
	showTemporaryTooltip(text: string, type: "primary" | "secondary" | "danger" | "success", duration: number): this {
		this.showTooltip(text, type);
		if (this.tooltipTimeout) {
			clearTimeout(this.tooltipTimeout);
		}
		this.tooltipTimeout = setTimeout(() => this.hideTooltip(), duration);
		return this;
	}

	/**
	 * Hides the tooltip.
	 */
	hideTooltip(): this {
		if (this.tooltipElement) {
			this.element.removeChild(this.tooltipElement);
			this.tooltipElement = null;
		}
		return this;
	}
}

/**
 * Converts an element to a tooltip container.
 * Warning: This might mess with positioning.
 * @param element The element to convert
 * @returns The tooltip container
 */
export function buildTooltipContainer(element: HTMLElement): TooltipContainer {
	element.style.position = "relative";
	return new TooltipContainer(element);
}