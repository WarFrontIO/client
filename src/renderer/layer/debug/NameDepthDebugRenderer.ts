import {DebugRendererLayer} from "./DebugRenderer";
import {playerNameRenderingManager} from "../../manager/PlayerNameRenderingManager";
import {gameMap} from "../../../game/GameData";
import {mapNavigationHandler} from "../../../game/action/MapNavigationHandler";
import {getSettingObject} from "../../../util/settings/UserSettingManager";

//@module renderer-debug

export class NameDepthDebugRenderer implements DebugRendererLayer {
	readonly useCache = false;

	render(context: CanvasRenderingContext2D): void {
		const map = playerNameRenderingManager.getNameDepth();
		const xMin = mapNavigationHandler.getMapX(0);
		const xMax = mapNavigationHandler.getMapX(context.canvas.width);
		const yMin = mapNavigationHandler.getMapY(0);
		const yMax = mapNavigationHandler.getMapY(context.canvas.height);
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			if (mapNavigationHandler.zoom < 1 || i % gameMap.width + 1 < xMin || i % gameMap.width > xMax || Math.floor(i / gameMap.width) + 1 < yMin || Math.floor(i / gameMap.width) > yMax) {
				continue;
			}
			const depth = map[i];
			if (depth !== 0) {
				context.fillStyle = `rgba(${255 * depth / 50}, 0, 0, 0.5)`;
				context.fillRect((i % gameMap.width) * mapNavigationHandler.zoom + mapNavigationHandler.x, Math.floor(i / gameMap.width) * mapNavigationHandler.zoom + mapNavigationHandler.y, mapNavigationHandler.zoom, mapNavigationHandler.zoom);
			}
		}
	}
}

getSettingObject("debug-renderer").option("name-depth", new NameDepthDebugRenderer(), "Name Depth", false);