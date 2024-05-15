import {CachedLayer} from "./CachedLayer";
import {gameMap} from "../../game/Game";
import {MapMoveListener, MapScaleListener, mapTransformHandler} from "../../event/MapTransformHandler";
import {theme} from "../../Loader";

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
			theme.getTileColor(gameMap.getTile(i)).writeToBuffer(imageData.data, i * 4);
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