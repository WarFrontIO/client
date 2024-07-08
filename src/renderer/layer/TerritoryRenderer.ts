import { CachedLayer } from "./CachedLayer";
import { Game } from "../../game/Game";
import { MapMoveListener, MapScaleListener, MapTransformHandler } from "../../event/MapTransformHandler";
import { GameMap } from "../../map/GameMap";

/**
 * Territory renderer.
 * Renders territory colors on the map (e.g. player territories).
 * @internal
 */
export class TerritoryRenderer extends CachedLayer implements MapMoveListener, MapScaleListener {
	private readonly gameMap: GameMap;

	constructor(gameMap: GameMap, mapTransformHandler: MapTransformHandler) {
		super();
		this.gameMap = gameMap;
		mapTransformHandler.move.register(this);
		mapTransformHandler.scale.register(this);
	}

	invalidateCaches(): void {
		this.resizeCanvas(this.gameMap.width, this.gameMap.height);
	}

	onMapMove(x: number, y: number): void {
		this.dx = x;
		this.dy = y;
	}

	onMapScale(scale: number): void {
		this.scale = scale;
	}
}