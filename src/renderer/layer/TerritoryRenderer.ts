import {CachedLayer} from "./CachedLayer";
import {gameMap} from "../../game/Game";
import {MapMoveListener, MapScaleListener, mapTransformHandler} from "../../event/MapTransformHandler";

/**
 * Territory renderer.
 * Renders territory colors on the map (e.g. player territories).
 * @internal
 */
class TerritoryRenderer extends CachedLayer implements MapMoveListener, MapScaleListener {
	constructor() {
		super();
		mapTransformHandler.move.register(this);
		mapTransformHandler.scale.register(this);
	}

	invalidateCaches(): void {
		this.resizeCanvas(gameMap.width, gameMap.height);
	}

	onMapMove(x: number, y: number): void {
		this.dx = x;
		this.dy = y;
	}

	onMapScale(scale: number): void {
		this.scale = scale;
	}
}

export const territoryRenderer = new TerritoryRenderer();