import {Color} from "../../util/Color";
import {TileType} from "../../map/tile/TileType";

/**
 * All colors, fonts, and other theme-related properties should be passed through a theme object.
 * This allows for easy customization of the game's appearance.
 */
export abstract class GameTheme {
	/**
	 * Get the color of a territory.
	 * @param color base player color
	 * @returns the color of the territory
	 */
	abstract getTerritoryColor(color: Color): Color;

	/**
	 * Get the border color of a territory.
	 * @param color base player color
	 * @returns the border color of the territory
	 */
	abstract getBorderColor(color: Color): Color;

	/**
	 * Get the color of a tile.
	 * @param tile the type of the tile
	 * @returns the color of the tile
	 */
	abstract getTileColor(tile: TileType): Color;
}