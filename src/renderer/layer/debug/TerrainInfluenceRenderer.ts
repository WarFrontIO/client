import {DebugRendererLayer} from "./DebugRenderer";
import {gameMap} from "../../../game/GameData";
import {getSettingObject} from "../../../util/settings/UserSettingManager";

export class TerrainInfluenceRenderer implements DebugRendererLayer {
	readonly useCache = true;

	/**
	 * Create a new terrain influence renderer
	 * @param simplified Whether to show tiles of the same area in the same color.
	 * @param navigableOnly Whether to only show navigable tiles.
	 */
	constructor(private simplified: boolean, private navigableOnly: boolean) {}

	render(context: CanvasRenderingContext2D): void {
		const colorMap = new Map<number, string>();
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			if (this.navigableOnly && !gameMap.getTile(i).navigable) continue;
			const area = this.simplified ? gameMap.areaMap[gameMap.tileInfluence[i]] : gameMap.tileInfluence[i];
			let color = colorMap.get(area);
			if (!color) {
				color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
				colorMap.set(area, color);
			}
			context.fillStyle = color;
			context.fillRect(i % gameMap.width, Math.floor(i / gameMap.width), 1, 1);
		}
	}
}

getSettingObject("debug-renderer").option("tile-influence-simplified", new TerrainInfluenceRenderer(true, false), "Terrain Influence", false);
getSettingObject("debug-renderer").option("tile-influence", new TerrainInfluenceRenderer(false, false), "Terrain Influence (Detailed)", false);