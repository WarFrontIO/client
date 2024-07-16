import {TileType} from "./TileType";
import {TileTypeIds} from "./TileTypeIds";
import {HSLColor} from "../../util/HSLColor";

export class GrassTile extends TileType {
	readonly id: number = TileTypeIds.GRASS;
	readonly internalName = "grass";
	readonly baseColor: HSLColor = HSLColor.fromRGB(40, 200, 20);
	readonly isSolid: boolean = true;

	render(_context: CanvasRenderingContext2D, _x: number, _y: number): void {
		//TODO sprite ?
	}
}