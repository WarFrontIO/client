/**
 * Generate an HTML ID for the HUD element,
 * with a random 6-digit number to prevent
 * collisions.
 * 
 * @param templateName Name of the HUD element template.
 * @returns ID for the HTML element
 */
function genElementId(templateName: string): string {
	let output = "";
	let isUnique = false;

	while (!isUnique) {
		output = "";
		[...Array(6)].forEach((_, i) => {
			output += Math.floor(Math.random() * 10);
		});
		if (!(!!document.getElementById("HudElement-" + templateName + "-" + output))) {
			isUnique = true;
		}
	}
	return "HudElement-" + templateName + "-" + output;
}

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
		this.element.id = genElementId(templateName);
		this.element.style.position = "fixed"; // Maybe change this later, I'm not a CSS wizard and there could be a better way :/
		this.element.style.display = "block";
		this.element.innerHTML = document.getElementById(templateName).innerHTML;

		this.xCoord = 0;
		this.yCoord = 0;
	}

	/**
	 * Set the inner HTMl of the HUD element.
	 * 
	 * @param innerHtml The innerHTML value to set.
	 */
	setInnerHtml(innerHtml: string) {
		this.element.innerHTML = innerHtml;
	}

	/**
	 * Set the textContent of the HUD element.
	 * Not recommended- use setInnerHtml instead!
	 * 
	 * @param textContent The textContent to give the element.
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

	getXCoord() {
		return this.xCoord;
	}

	getYCoord() {
		return this.yCoord;
	}

	setXCoord(xCoord: number) {
		this.xCoord = xCoord;
	}

	/**
	 * Destroy the element.
	 */
	destroy() {
		this.element.remove();
	}
}