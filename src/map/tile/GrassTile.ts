import {TileType} from "./TileType";
import {TileTypeIds} from "./TileTypeIds";
import {Color} from "../../util/Color";

export class GrassTile extends TileType {
	readonly id: number = TileTypeIds.GRASS;
	readonly baseColor: Color = Color.fromRGB(40, 200, 20);
	readonly isSolid: boolean = true;

	render(context: CanvasRenderingContext2D, x: number, y: number): void {
		//TODO sprite ?
	}
}