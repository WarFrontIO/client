import {TileType} from "./TileType";
import {TileTypeIds} from "./TileTypeIds";
import {HSLColor} from "../../util/HSLColor";

export class GrassTile extends TileType {
	readonly id: number = TileTypeIds.GRASS;
	readonly internalName = "grass";
	readonly baseColor: HSLColor = HSLColor.fromRGB(40, 200, 20);
	readonly isSolid: boolean = true;

	render(context: CanvasRenderingContext2D, x: number, y: number): void {
		//TODO sprite ?
	}
}