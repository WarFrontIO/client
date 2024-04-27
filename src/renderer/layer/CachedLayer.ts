import {RendererLayer} from "./RendererLayer";

/**
 * Caches rendered layer in a separate canvas.
 *
 * Useful for layers that are expensive to render and don't change very often.
 * Allows for faster rendering by only rendering the layer once and then reusing the cached image.
 * Can be scaled and moved like any other layer (you might need to listen to map events to update the position).
 */
export abstract class CachedLayer implements RendererLayer {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	dx: number = 0;
	dy: number = 0;
	scale: number = 1;

	protected constructor() {
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");
	}

	/**
	 * Resize the canvas to the given width and height.
	 * @param width width of the canvas
	 * @param height height of the canvas
	 * @protected
	 */
	protected resizeCanvas(width: number, height: number) {
		this.canvas.width = width;
		this.canvas.height = height;
	}

	render(context: CanvasRenderingContext2D): void {
		context.drawImage(this.canvas, this.dx, this.dy, this.canvas.width * this.scale, this.canvas.height * this.scale);
	}
}