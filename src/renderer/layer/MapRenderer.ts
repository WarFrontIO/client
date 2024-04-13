import {CachedLayer} from "./CachedLayer";
import {gameMap} from "../../game/Game";
import {MapMoveListener, MapScaleListener, mapTransformHandler} from "../../event/MapTransformHandler";

export class MapRenderer extends CachedLayer implements MapMoveListener, MapScaleListener {
	constructor() {
		super();
		this.resizeCanvas(gameMap.width, gameMap.height);
		const imageData = this.context.getImageData(0, 0, gameMap.width, gameMap.height);
		for (let y = 0; y < gameMap.height; y++) {
			for (let x = 0; x < gameMap.width; x++) {
				const tile = gameMap.getTile(x, y);
				const index = (y * gameMap.width + x) * 4;
				imageData.data[index] = tile.colorR;
				imageData.data[index + 1] = tile.colorG;
				imageData.data[index + 2] = tile.colorB;
				imageData.data[index + 3] = 255;
			}
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