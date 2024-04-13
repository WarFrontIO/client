import {TileType} from "./TileType";

export class GrassTile extends TileType {
	colorR: number = 40;
	colorG: number = 200;
	colorB: number = 20;
	isSolid: boolean = true;

	render(context: CanvasRenderingContext2D, x: number, y: number): void {
		//TODO sprite ?
	}
}