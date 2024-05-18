import {Color} from "../util/Color";
import {TileType} from "../map/tile/TileType";

/**
 * All colors, fonts, and other theme-related properties should be passed through a theme object.
 * This allows for easy customization of the game's appearance.
 */
export type GameTheme = {
	/**
	 * Get the color of a territory.
	 * @param color base player color
	 * @returns the color of the territory
	 */
	getTerritoryColor(color: Color): Color;

	/**
	 * Get the border color of a territory.
	 * @param color base player color
	 * @returns the border color of the territory
	 */
	getBorderColor(color: Color): Color;

	/**
	 * Get the color of a tile.
	 * @param tile the type of the tile
	 * @returns the color of the tile
	 */
	getTileColor(tile: TileType): Color;
}

const registry: Record<string, GameTheme> = {};

/**
 * Registers a theme.
 * @param name the name of the theme
 * @param theme the theme
 * @param tileOverrides overrides for tile colors
 */
export function registerTheme(name: string, theme: GameTheme, tileOverrides: Record<string, Color>) {
	theme.getTileColor = (tile: TileType) => {
		if (tile.internalName in tileOverrides) {
			return tileOverrides[tile.internalName];
		}
		return theme.getTileColor(tile);
	}
	registry[name] = theme;
}

/**
 * Retrieves a theme from the registry by its name.
 * @param name the name of the theme
 * @returns the theme
 */
export function getTheme(name: string): GameTheme {
	const theme = registry[name];
	if (!theme) {
		throw new Error(`Theme ${name} not found`);
	}
	return theme;
}

// The following lines are filled in by the build process
// BUILD_THEMES_REGISTER
// End of theme register block