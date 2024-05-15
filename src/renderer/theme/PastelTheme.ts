import {GameTheme} from "./GameTheme";
import {Color} from "../../util/Color";
import {TileType} from "../../map/tile/TileType";
import {GrassTile} from "../../map/tile/GrassTile";
import {WaterTile} from "../../map/tile/WaterTile";

export class PastelTheme extends GameTheme {
	getBorderColor(color: Color): Color {
		return color.withSaturation(color.s * 0.7).withLightness(0.6);
	}

	getTerritoryColor(color: Color): Color {
		return color.withSaturation(color.s * 0.7).withLightness(0.75);
	}

	getTileColor(tile: TileType): Color {
		if (tile instanceof GrassTile) {
			return Color.fromRGB(240, 210, 160);
		}
		if (tile instanceof WaterTile) {
			return Color.fromRGB(160, 200, 200);
		}
		Math.random() < 0.0001 && console.log(tile.baseColor);
		return tile.baseColor.withLightness(0.8);
	}
}