import {CachedLayer} from "./CachedLayer";
import {gameMap} from "../../game/Game";
import {MapMoveListener, MapScaleListener, mapTransformHandler} from "../../event/MapTransformHandler";
import {territoryRenderingManager} from "../manager/TerritoryRenderingManager";

/**
 * Territory renderer.
 * Renders territory colors on the map (e.g. player territories).
 * @internal
 */
export class TerritoryRenderer extends CachedLayer implements MapMoveListener, MapScaleListener {
	constructor() {
		super();
		this.resizeCanvas(gameMap.width, gameMap.height);
		mapTransformHandler.move.register(this);
		mapTransformHandler.scale.register(this);
		territoryRenderingManager.setContext(this.context);
	}

	onMapMove(x: number, y: number): void {
		this.dx = x;
		this.dy = y;
	}

	onMapScale(scale: number): void {
		this.scale = scale;
	}
}