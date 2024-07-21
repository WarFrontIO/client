import {RendererLayer} from "./RendererLayer";
import {boatManager} from "../../game/boat/BoatManager";

class BoatRenderer implements RendererLayer {
	render(context: CanvasRenderingContext2D): void {
		boatManager.render(context);
	}
}

export const boatRenderer = new BoatRenderer();