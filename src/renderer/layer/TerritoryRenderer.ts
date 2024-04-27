import {CachedLayer} from "./CachedLayer";
import {gameMap} from "../../game/Game";
import {MapMoveListener, MapScaleListener, mapTransformHandler} from "../../event/MapTransformHandler";

/**
 * Territory renderer.
 * Renders territory colors on the map (e.g. player territories).
 * @internal
 */
export class TerritoryRenderer extends CachedLayer implements MapMoveListener, MapScaleListener {
	private readonly imgData: ImageData;
	private readonly pixels: Uint8ClampedArray;
	private hasChanges: boolean = false;

	constructor() {
		super();
		this.resizeCanvas(gameMap.width, gameMap.height);
		this.imgData = this.context.getImageData(0, 0, gameMap.width, gameMap.height);
		this.pixels = this.imgData.data;
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
	 * @param index index of the pixel
	 * @param r red color value
	 * @param g green color value
	 * @param b blue color value
	 */
	set(index: number, r: number, g: number, b: number) {
		const i = index * 4;
		this.pixels[i] = r;
		this.pixels[i + 1] = g;
		this.pixels[i + 2] = b;
		this.pixels[i + 3] = 255;
		this.hasChanges = true;
	}

	/**
	 * Clear the color of a pixel on the territory layer.
	 * Pixel will be fully transparent afterward.
	 * @param index index of the pixel
	 */
	clear(index: number) {
		const i = index * 4;
		this.pixels[i] = 0;
		this.pixels[i + 1] = 0;
		this.pixels[i + 2] = 0;
		this.pixels[i + 3] = 0;
		this.hasChanges = true;
	}

	render(context: CanvasRenderingContext2D) {
		if (this.hasChanges) {
			this.context.putImageData(this.imgData, 0, 0);
			this.hasChanges = false;
		}
		super.render(context);
	}
}

//TODO: Remove this. Changed tiles should be staged in a separate manager first
export let territoryRenderer: TerritoryRenderer;