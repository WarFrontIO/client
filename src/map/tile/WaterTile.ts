import {TileType} from "./TileType";
import {TileTypeIds} from "./TileTypeIds";

export class WaterTile extends TileType {
	readonly id: number = TileTypeIds.WATER;
	readonly colorR: number = 0;
	readonly colorG: number = 0;
	readonly colorB: number = 200;
	readonly isSolid: boolean = false;

	render(context: CanvasRenderingContext2D, x: number, y: number): void {
		//TODO sprite ?
	}
}