import {RendererLayer} from "./RendererLayer";

/**
 * A simple background layer that fills the canvas with a color.
 * This also clears any previous content on the canvas, so transparent layers don't leave artifacts.
 */
export class BackgroundLayer implements RendererLayer {
	render(context: CanvasRenderingContext2D): void {
		context.fillStyle = "#555";
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}
}