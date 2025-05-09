import {HSLColor} from "../../util/HSLColor";
import {playerManager} from "../../game/player/PlayerManager";
import {territoryManager} from "../../game/TerritoryManager";
import {GameTheme} from "../GameTheme";
import {gameMap, isPlaying} from "../../game/GameData";
import {RGBColor} from "../../util/RGBColor";

/**
 * When a player claims a tile, three types of updates are required:
 * 1. The tile can become a border tile of the player's territory.
 * 2. The tile can become an inner tile of the player's territory.
 * 3. A neighboring tile can become a border tile of the player's territory.
 */
export class TerritoryRenderingManager {
	imageData: ImageData;
	dirty: {x1: number, y1: number, x2: number, y2: number}[];

	init(context: CanvasRenderingContext2D): void {
		this.imageData = context.getImageData(0, 0, gameMap.width, gameMap.height);
		this.dirty = [];
	}

	/**
	 * Clear the tiles at the given indices.
	 * @param tiles the tiles to clear
	 */
	clearTiles(tiles: number[] | Set<number>): void {
		let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
		for (const tile of tiles) {
			this.imageData.data[tile * 4 + 3] = 0;
			x1 = Math.min(x1, tile % gameMap.width);
			y1 = Math.min(y1, Math.floor(tile / gameMap.width));
			x2 = Math.max(x2, tile % gameMap.width);
			y2 = Math.max(y2, Math.floor(tile / gameMap.width));
		}
		if (x1 === Infinity) return; //TODO: empty tiles
		this.dirty.push({x1, y1, x2, y2});
	}

	/**
	 * Paint a tile.
	 * @param tiles the tiles to paint
	 * @param color the color to paint the tiles
	 * @internal
	 */
	paintTiles(tiles: number[], color: HSLColor): void {
		const rgb = color.toRGB();
		let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
		for (const tile of tiles) {
			this.imageData.data[tile * 4] = rgb.r;
			this.imageData.data[tile * 4 + 1] = rgb.g;
			this.imageData.data[tile * 4 + 2] = rgb.b;
			this.imageData.data[tile * 4 + 3] = rgb.a * 255;
			x1 = Math.min(x1, tile % gameMap.width);
			y1 = Math.min(y1, Math.floor(tile / gameMap.width));
			x2 = Math.max(x2, tile % gameMap.width);
			y2 = Math.max(y2, Math.floor(tile / gameMap.width));
		}
		if (tiles.length === 0) return; //TODO: fix this??
		this.dirty.push({x1, y1, x2, y2});
	}

	/**
	 * Force a repaint of the territory layer.
	 */
	forceRepaint(theme: GameTheme): void {
		if (!isPlaying) return;
		const colorCache: RGBColor[] = [];
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const owner = territoryManager.getOwner(i);
			if (owner !== territoryManager.OWNER_NONE && owner !== territoryManager.OWNER_NONE - 1) {
				const player = playerManager.getPlayer(owner);
				const isTerritory = territoryManager.isTerritory(i);
				const index = (owner << 1) + (isTerritory ? 1 : 0);
				if (!colorCache[index]) {
					colorCache[index] = isTerritory ? theme.getTerritoryColor(player.baseColor).toRGB() : theme.getBorderColor(player.baseColor).toRGB();
				}
				colorCache[index].writeToBuffer(this.imageData.data, i * 4);
			}
		}
		this.dirty.push({x1: 0, y1: 0, x2: gameMap.width, y2: gameMap.height});
	}
}