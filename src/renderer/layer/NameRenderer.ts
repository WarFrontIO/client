import {RendererLayer} from "./RendererLayer";
import {mapNavigationHandler} from "../../game/action/MapNavigationHandler";
import {playerNameRenderingManager} from "../manager/PlayerNameRenderingManager";

export class NameRenderer implements RendererLayer {
	render(context: CanvasRenderingContext2D): void {
		context.textRendering = "optimizeSpeed";
		context.textAlign = "center";
		context.textBaseline = "bottom";
		context.fillStyle = "rgb(255, 255, 255)";
		const zoom = mapNavigationHandler.zoom;
		const x = mapNavigationHandler.x;
		const y = mapNavigationHandler.y;
		let currentSize = 0;
		let currentBaseline = "bottom";
		for (const data of playerNameRenderingManager.getTextData()) {
			if (data.size === 0) continue;
			if (data.size !== currentSize) {
				context.font = "bold " + Math.floor(data.size * zoom / 4) + "px Arial";
				currentSize = data.size;
			}
			if (data.baseline !== currentBaseline) {
				context.textBaseline = data.baseline;
				currentBaseline = data.baseline;
			}
			context.fillText(data.text, data.x * zoom + x, data.y * zoom + y);
		}
	}
}