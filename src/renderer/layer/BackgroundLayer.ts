import {RendererLayer} from "./RendererLayer";

export class BackgroundLayer implements RendererLayer {
	render(context: CanvasRenderingContext2D): void {
		context.fillStyle = "#555";
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}
}