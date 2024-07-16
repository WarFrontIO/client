import {TileType} from "./TileType";
import {TileTypeIds} from "./TileTypeIds";
import {HSLColor} from "../../util/HSLColor";

export class WaterTile extends TileType {
	readonly id: number = TileTypeIds.WATER;
	readonly internalName = "water";
	readonly baseColor: HSLColor = HSLColor.fromRGB(0, 0, 200);
	readonly isSolid: boolean = false;

	render(_context: CanvasRenderingContext2D, _x: number, _y: number): void {
		//TODO sprite ?
	}
}