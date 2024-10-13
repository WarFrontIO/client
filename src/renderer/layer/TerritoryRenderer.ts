import {CachedLayer} from "./CachedLayer";
import {mapTransformHandler} from "../../event/MapTransformHandler";
import {gameMap} from "../../game/GameData";

/**
 * Territory renderer.
 * Renders territory colors on the map (e.g. player territories).
 * @internal
 */
class TerritoryRenderer extends CachedLayer {
	invalidateCaches(): void {
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

import("../manager/TerritoryRenderingManager");