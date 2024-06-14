import {RendererLayer} from "./RendererLayer";
import {playerNameRenderingManager} from "../manager/PlayerNameRenderingManager";
import {playerManager} from "../../game/player/PlayerManager";
import {mapNavigationHandler} from "../../game/action/MapNavigationHandler";

class NameRenderer implements RendererLayer {
	render(context: CanvasRenderingContext2D): void {
		context.textRendering = "optimizeSpeed";
		context.textAlign = "center";
		const xMin = mapNavigationHandler.getMapX(0);
		const xMax = mapNavigationHandler.getMapX(context.canvas.width);
		const yMin = mapNavigationHandler.getMapY(0);
		const yMax = mapNavigationHandler.getMapY(context.canvas.height);
		console.log(xMin, xMax, yMin, yMax);
		for (let i = 0; i < playerNameRenderingManager.playerData.length; i++) {
			const player = playerManager.getPlayer(i);
			if (player && player.isAlive()) {
				const data = playerNameRenderingManager.playerData[i];
				if (data.size * mapNavigationHandler.zoom < 1 || data.nameX + data.size < xMin || data.nameX > xMax || data.nameY + data.size < yMin || data.nameY > yMax) {
					continue;
				}
				data.renderPlayer(context, player);
			}
		}
	}
}

export const nameRenderer = new NameRenderer();