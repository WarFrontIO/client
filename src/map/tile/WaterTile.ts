import {TileType} from "./TileType";
import {TileTypeIds} from "./TileTypeIds";
import {Color} from "../../util/Color";

export class WaterTile extends TileType {
	readonly id: number = TileTypeIds.WATER;
	readonly baseColor: Color = Color.fromRGB(0, 0, 200);
	readonly isSolid: boolean = false;

	render(context: CanvasRenderingContext2D, x: number, y: number): void {
		//TODO sprite ?
	}
}