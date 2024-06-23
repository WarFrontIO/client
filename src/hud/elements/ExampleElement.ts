import {HudElement} from "../HudElement";

export class ExampleElement extends HudElement {
	constructor() {
		super("ExampleElement");

		this.setCoordinates(100, 100);
		document.addEventListener("keydown", (event) => {
			switch (event.key) {
				case "ArrowUp":
					this.shiftYCoord(-10);
					break;
				
				case "ArrowDown":
					this.shiftYCoord(10);
					break;

				case "ArrowLeft":
					this.shiftXCoord(-10);
					break;

				case "ArrowRight":
					this.shiftXCoord(10);
					break;

			}
		});
		this.show();
	}
}