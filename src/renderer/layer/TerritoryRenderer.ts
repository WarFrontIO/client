import {CachedLayer} from "./CachedLayer";
import {gameMap} from "../../game/Game";
import {MapMoveListener, MapScaleListener, mapTransformHandler} from "../../event/MapTransformHandler";
import {Color} from "../../util/Color";

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
		territoryRenderer = this;
	}

	onMapMove(x: number, y: number): void {
		this.dx = x;
		this.dy = y;
	}

	onMapScale(scale: number): void {
		this.scale = scale;
	}

	/**
	 * Set the color of a pixel on the territory layer.
	 * Pixel will be rendered on the next render tick.
	 * @param tile index of the pixel
	 * @param color color of the pixel
	 */
	set(tile: number, color: Color) {
		//TODO: We can probably save some rendering time by sorting operations by territory owner
		this.context.fillStyle = color.toString();
		this.context.fillRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
	}

	/**
	 * Clear the color of a pixel on the territory layer.
	 * Pixel will be fully transparent afterward.
	 * @param tile index of the pixel
	 */
	clear(tile: number) {
		this.context.clearRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
	}
}

//TODO: Remove this. Changed tiles should be staged in a separate manager first
export let territoryRenderer: TerritoryRenderer;