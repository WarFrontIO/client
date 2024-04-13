import {RendererLayer} from "./RendererLayer";

export abstract class CachedLayer implements RendererLayer {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	dx: number = 0;
	dy: number = 0;
	scale: number = 1;

	constructor() {
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");
	}

	resizeCanvas(width: number, height: number) {
		this.canvas.width = width;
		this.canvas.height = height;
	}

	render(context: CanvasRenderingContext2D): void {
		context.drawImage(this.canvas, this.dx, this.dy, this.canvas.width * this.scale, this.canvas.height * this.scale);
	}
}