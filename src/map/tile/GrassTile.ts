import {TileType} from "./TileType";
import {TileTypeIds} from "./TileTypeIds";

export class GrassTile extends TileType {
	readonly id: number = TileTypeIds.GRASS;
	readonly colorR: number = 40;
	readonly colorG: number = 200;
	readonly colorB: number = 20;
	readonly isSolid: boolean = true;

	render(context: CanvasRenderingContext2D, x: number, y: number): void {
		//TODO sprite ?
	}
}