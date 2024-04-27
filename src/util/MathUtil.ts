import {gameMap} from "../game/Game";

export function getNeighbors(tile: number): number[] {
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