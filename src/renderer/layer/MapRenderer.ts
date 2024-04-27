import {CachedLayer} from "./CachedLayer";
import {gameMap} from "../../game/Game";
import {MapMoveListener, MapScaleListener, mapTransformHandler} from "../../event/MapTransformHandler";

/**
 * Map background renderer.
 * All static map tiles (and possibly other static objects) should be rendered here.
 * @internal
 */
export class MapRenderer extends CachedLayer implements MapMoveListener, MapScaleListener {
	constructor() {
		super();
		this.resizeCanvas(gameMap.width, gameMap.height);
		const imageData = this.context.getImageData(0, 0, gameMap.width, gameMap.height);
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const tile = gameMap.getTile(i);
			imageData.data[4 * i] = tile.colorR;
			imageData.data[4 * i + 1] = tile.colorG;
			imageData.data[4 * i + 2] = tile.colorB;
			imageData.data[4 * i + 3] = 255;
		}
		this.context.putImageData(imageData, 0, 0);
		mapTransformHandler.move.register(this);
		mapTransformHandler.scale.register(this);
	}

	onMapMove(x: number, y: number): void {
		this.dx = x;
		this.dy = y;
	}

	onMapScale(scale: number): void {
		this.scale = scale;
	}
}