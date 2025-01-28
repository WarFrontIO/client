import {DebugRendererLayer} from "./DebugRenderer";
import {gameMap} from "../../../game/GameData";
import {getSettingObject} from "../../../util/settings/UserSettingManager";

export class TerrainDepthRenderer implements DebugRendererLayer {
	readonly useCache = true;

	render(context: CanvasRenderingContext2D): void {
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const depth = gameMap.distanceMap[i];
			if (depth > 0) {
				context.fillStyle = `rgba(0, ${255 * depth / 50}, 0, 0.5)`;
			} else {
				context.fillStyle = `rgba(0, 0, ${255 * -depth / 50}, 0.5)`;
			}
			context.fillRect(i % gameMap.width, Math.floor(i / gameMap.width), 1, 1);
		}
	}
}

getSettingObject("debug-renderer").option("terrain-depth", new TerrainDepthRenderer(), "Terrain Depth", false);