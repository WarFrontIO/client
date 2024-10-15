import {CachedLayer} from "./CachedLayer";
import {mapTransformHandler} from "../../event/MapTransformHandler";
import {gameMap} from "../../game/GameData";
import {gameStartRegistry} from "../../game/Game";

/**
 * Territory renderer.
 * Renders territory colors on the map (e.g. player territories).
 * @internal
 */
class TerritoryRenderer extends CachedLayer {
	init(): void {
		this.resizeCanvas(gameMap.width, gameMap.height);
	}

	onMapMove(this: void, x: number, y: number): void {
		territoryRenderer.dx = x;
		territoryRenderer.dy = y;
	}

	onMapScale(this: void, scale: number): void {
		territoryRenderer.scale = scale;
	}
}

export const territoryRenderer = new TerritoryRenderer();

mapTransformHandler.scale.register(territoryRenderer.onMapScale);
mapTransformHandler.move.register(territoryRenderer.onMapMove);
gameStartRegistry.register(territoryRenderer.init.bind(territoryRenderer));

import("../manager/TerritoryRenderingManager");