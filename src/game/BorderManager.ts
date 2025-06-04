import {gameMap} from "./GameData";
import {territoryManager} from "./TerritoryManager";

class BorderManager {
	private tileGrades: Uint8Array;
	private borderTiles: Set<number>[];

	/**
	 * Resets the border manager.
	 * Should only be called when a new game is started.
	 * @param playerCount The number of players in the game
	 * @internal
	 */
	reset(playerCount: number): void {
		this.tileGrades = new Uint8Array(gameMap.width * gameMap.height);
		this.borderTiles = new Array(playerCount).fill(null).map(() => new Set());
	}

	/**
	 * Checks for updated borders when claiming tiles.
	 * @param tiles The tiles that were claimed.
	 * @param attacker The player that claimed the tiles.
	 * @param defender The player that lost the tiles.
	 */
	transitionTiles(tiles: Set<number>, attacker: number, defender: number): BorderTransitionResult {
		const attackerBorder = this.borderTiles[attacker];
		const defenderBorder = this.borderTiles[defender] || new Set();
		const result: BorderTransitionResult = {territory: [], attacker: [], defender: []};
		for (const tile of tiles) {
			let grade = 0;
			gameMap.onNeighbors(tile, (neighbor) => {
				const owner = territoryManager.getOwner(neighbor);
				if (owner === defender) {
					//We don't need to fear handling conquered tiles here, as they should already have the attacker as owner
					if (this.tileGrades[neighbor]-- === 4) {
						defenderBorder.add(neighbor);
						result.defender.push(neighbor);
					}
				} else if (owner === attacker) {
					grade++;
					if (!tiles.has(neighbor) && ++this.tileGrades[neighbor] === 4) {
						attackerBorder.delete(neighbor);
						result.territory.push(neighbor);
					}
				}
			});

			defenderBorder.delete(tile);
			this.tileGrades[tile] = grade;
			if (grade < 4) {
				attackerBorder.add(tile);
				result.attacker.push(tile);
			} else {
				result.territory.push(tile);
			}
		}

		return result;
	}

	/**
	 * Gets the border tiles of a player.
	 * @param player The player to get the border tiles of
	 * @returns The border tiles of the player
	 */
	getBorderTiles(player: number): Set<number> {
		return this.borderTiles[player];
	}
}

export const borderManager = new BorderManager();
export type BorderTransitionResult = {
	territory: number[]; // Tiles that changed to attacker territory
	attacker: number[]; // Tiles that changed to attacker border
	defender: number[]; // Tiles that changed to defender border
};