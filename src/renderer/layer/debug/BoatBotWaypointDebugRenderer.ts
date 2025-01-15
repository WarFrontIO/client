import {DebugRendererLayer} from "./DebugRendererRegistry";
import {mapNavigationHandler} from "../../../game/action/MapNavigationHandler";
import {gameMap} from "../../../game/GameData";

export class BoatBotWaypointDebugRenderer implements DebugRendererLayer {
	readonly useCache = false;

	render(context: CanvasRenderingContext2D): void {
		context.strokeStyle = "red";
		context.fillStyle = "orange";
		for (const [source, targets] of gameMap.boatTargets) {
			for (const target of targets) {
				if (source > target.tile) continue; // Only draw each edge once
				context.beginPath();
				context.moveTo((target.path[0] % gameMap.width + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.x, (Math.floor(target.path[0] / gameMap.width) + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.y);
				for (let i = 1; i < target.path.length; i++) {
					context.lineTo((target.path[i] % gameMap.width + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.x, (Math.floor(target.path[i] / gameMap.width) + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.y);
				}
				context.stroke();
			}
		}
	}
}
