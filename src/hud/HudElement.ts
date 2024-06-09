/**
 * Extend off this class
 * when making HUD elements.
 * 
 * @todo Write a better JSDoc for HudElement lol
 */
export class HudElement {
	private element: HTMLDivElement;
	private xCoord: number;
	private yCoord: number;

	constructor(templateName: string) {
		this.element = document.getElementById(templateName) as HTMLDivElement;
		this.element.style.position = "fixed";

		this.xCoord = 0;
		this.yCoord = 0;
	}

	/**
	 * Getter for HudElement.element
	 * @returns The underlying HTML element
	 */
	getElement() {
		return this.element;
	}

	/**
	 * Show the element.
	 */
	show() {
		this.element.style.display = "block";
	}

	/**
	 * Hide the element
	 */
	hide() {
		this.element.style.display = "none";
	}

	/**
	 * Updates the underlying HTML element's
	 * position in accordance with the HUD
	 * element's xCoord and yCoord.
	 */
	private updateCoordinates() {
		this.element.style.top = this.yCoord.toString() + "px";
		this.element.style.left = this.xCoord.toString() + "px";
	}

	/**
	 * Move the element to the given coordinates.
	 * Coordinates begin in the top-left.
	 * 
	 * @param x X coordinate to move the element to
	 * @param y Y coordinate to move the element to
	 */
	setCoordinates(x: number, y: number) {
		this.xCoord = x;
		this.yCoord = y;
		this.updateCoordinates();
	}

	/**
	 * Calls HudElement.setCoordinates() but applies
	 * the provided X and Y shifts to the current
	 * coordinates.
	 * 
	 * @param xShift Units to shift the element along the X axis.
	 * @param yShift Units to shift the element along the Y axis.
	 */
	shiftCoordinates(xShift: number, yShift: number) {
		this.setCoordinates(this.xCoord + xShift, this.yCoord + yShift);
	}

	/**
	 * Getter for HudElement.xCoord
	 * @returns X coordinate of the HUD element
	 */
	getXCoord() {
		return this.xCoord;
	}

	/**
	 * Getter for HudElement.yCoord
	 * @returns Y coordinate of the HUD element
	 */
	getYCoord() {
		return this.yCoord;
	}

	/**
	 * Setter for HudElement.xCoord
	 * @param xCoord New X coordinate for the HUD element
	 */
	setXCoord(xCoord: number) {
		this.xCoord = xCoord;
		this.updateCoordinates();
	}

	/**
	 * Setter for HudElement.yCoord
	 * @param yCoord New Y coordinate for the HUD element
	 */
	setYCoord(yCoord: number) {
		this.yCoord = yCoord;
		this.updateCoordinates();
	}
}