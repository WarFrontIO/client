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
		this.element = document.createElement("div") as HTMLDivElement;
		this.element.id = "HudElement-" + templateName;
		this.element.style.position = "fixed"; // Maybe change this later, I'm not a CSS wizard and there could be a better way :/
		this.element.style.display = "block";
		this.element.innerHTML = document.getElementById(templateName).innerHTML;

		this.xCoord = 0;
		this.yCoord = 0;
	}

	/**
	 * Set the inner HTMl of the HUD element.
	 * 
	 * @param innerHtml The innerHTML value to set
	 */
	setInnerHtml(innerHtml: string) {
		this.element.innerHTML = innerHtml;
	}

	/**
	 * Set the textContent of the HUD element.
	 * Not recommended- use setInnerHtml instead!
	 * 
	 * @param textContent The textContent to give the element
	 */
	setTextContent(textContent: string) {
		this.element.textContent = textContent;
	}

	/**
	 * Spawn the element at the given coordinates.
	 * Coordinates begin in the top-left.
	 * 
	 * @param x X coordinate to spawn the element at
	 * @param y Y coordinate to spawn the element at
	 */
	spawn(x: number, y: number) {
		this.setCoordinates(x, y);
		document.body.appendChild(this.element);
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

	/**
	 * Destroy the element.
	 */
	destroy() {
		this.element.remove();
	}
}