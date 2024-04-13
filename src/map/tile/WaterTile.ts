import {TileType} from "./TileType";

export class WaterTile extends TileType {
	colorR: number = 0;
	colorG: number = 0;
	colorB: number = 200;
	isSolid: boolean = false;

	render(context: CanvasRenderingContext2D, x: number, y: number): void {
		//TODO sprite ?
	}
}