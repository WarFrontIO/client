import {TileType} from "./tile/TileType";
import {WaterTile} from "./tile/WaterTile";
import {GrassTile} from "./tile/GrassTile";
import {gameMap} from "../game/Game";

export class TileManager {
	private tileTypes: TileType[] = [];

	constructor() {
		this.registerTileType(new WaterTile());
		this.registerTileType(new GrassTile());
	}

	registerTileType(tileType: TileType): void {
		this.tileTypes.push(tileType);
		tileType.id = this.tileTypes.length - 1;
	}

	fromID(id: number): TileType {
		return this.tileTypes[id];
	}

	fromColor(colorR: number, colorG: number, colorB: number): TileType {
		let closestTile: TileType = this.tileTypes[0];
		let closestDistance: number = Number.MAX_VALUE;
		for (let tileType of this.tileTypes) {
			let distance = Math.sqrt(
				Math.pow(colorR - tileType.colorR, 2) +
				Math.pow(colorG - tileType.colorG, 2) +
				Math.pow(colorB - tileType.colorB, 2)
			);
			if (distance < closestDistance) {
				closestTile = tileType;
				closestDistance = distance;
			}
		}
		return closestTile;
	}

	getNeighbors(tile: number): number[] {
		let x = tile % gameMap.width;
		let y = Math.floor(tile / gameMap.width);
		let neighbors: number[] = [];
		if (x > 0) {
			neighbors.push(tile - 1);
		}
		if (x < gameMap.width - 1) {
			neighbors.push(tile + 1);
		}
		if (y > 0) {
			neighbors.push(tile - gameMap.width);
		}
		if (y < gameMap.height - 1) {
			neighbors.push(tile + gameMap.width);
		}
		return neighbors;
	}
}