import {DebugRendererLayer} from "./DebugRendererRegistry";
import {gameMap} from "../../../game/GameData";

export class TerrainInfluenceRenderer implements DebugRendererLayer {
	readonly useCache = true;

	render(context: CanvasRenderingContext2D): void {
		const colorMap = new Map<number, string>();
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const area = gameMap.areaMap[gameMap.tileInfluence[i]];
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