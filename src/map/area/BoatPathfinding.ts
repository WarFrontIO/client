import {PriorityQueue} from "../../util/PriorityQueue";
import {areaCalculator, Node} from "./AreaCalculator";
import {territoryManager} from "../../game/TerritoryManager";
import {clientPlayer} from "../../game/player/PlayerManager";
import {UnsupportedDataException} from "../../util/exception/UnsupportedDataException";
import {gameMap} from "../../game/GameData";

/**
 * Pathfinding for boats.
 * Hierarchical pathfinding with a single level of abstraction.
 * This is heavily adapted to the specific use-case of the game.
 */

/**
 * Calculates a list of waypoints between two points.
 * @param start The starting position.
 * @param end The ending position.
 * @returns The path as an array of cached path indices (these combine to form the path).
 */
export function calculateBoatWaypoints(start: number, end: number): number[][] {
	const startAreaId = areaCalculator.areaIndex[start];
	const startX = start % gameMap.width, startY = Math.floor(start / gameMap.width);

	let inSameArea = false;
	onNeighborWater(end, tile => {
		if (areaCalculator.areaIndex[tile] === startAreaId) {
			inSameArea = true;
		}
	});
	if (inSameArea) {
		return [findPathInArea(start, end), [end]];
	}

	const queue = new PriorityQueue<[Node, number, number]>((a, b) => a[1] < b[1]);
	const costs = [];
	const parents: { node: Node, cache: number[] }[] = [];
	onNeighborWater(end, tile => {
		const startPoints = findStartsInArea(tile);
		for (const node of areaCalculator.nodeIndex[areaCalculator.areaIndex[tile]]) {
			queue.push([node, startPoints[(node.x % areaCalculator.AREA_SIZE) + (node.y % areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE] + Math.sqrt((node.x - startX) * (node.x - startX) + (node.y - startY) * (node.y - startY)), startPoints[(node.x % areaCalculator.AREA_SIZE) + (node.y % areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE]]);
			costs[node.id] = 1;
		}
	});
	while (!queue.isEmpty()) {
		const [node, _, cost] = queue.pop();
		if (node.canonicalAreaId === startAreaId) {
			const path: number[][] = [];
			let current = {node, cache: findPathInArea(start, node.x + node.y * gameMap.width)}, last = current;
			while (current !== undefined) {
				path.push(current.cache);
				last = current;
				current = parents[current.node.id];
			}
			path.pop();
			path.push(findPathInArea(last.node.x + last.node.y * gameMap.width, end));
			path.push([end]);
			return path;
		}
		for (const edge of node.edges) {
			const newCost = cost + edge.cost + Math.sqrt((edge.node.x - startX) * (edge.node.x - startX) + (edge.node.y - startY) * (edge.node.y - startY));
			if (costs[edge.node.id] && costs[edge.node.id] <= newCost) {
				continue;
			}
			if (!costs[edge.node.id]) queue.push([edge.node, newCost, cost + edge.cost]);
			else queue.update(element => element[0] === edge.node, [edge.node, newCost, cost + edge.cost]);
			costs[edge.node.id] = newCost;
			parents[edge.node.id] = {node, cache: edge.cache};
		}
	}
	return [];
}

/**
 * Finds a path between two points in the same area.
 * @param start The starting position.
 * @param end The ending position.
 * @returns The path from start to end.
 */
function findPathInArea(start: number, end: number) {
	const minX = Math.floor((end % gameMap.width) / areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE;
	const minY = Math.floor(Math.floor(end / gameMap.width) / areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE;
	const width = Math.min(gameMap.width - minX, areaCalculator.AREA_SIZE);
	const height = Math.min(gameMap.height - minY, areaCalculator.AREA_SIZE);
	const startX = start % gameMap.width - minX, startY = Math.floor(start / gameMap.width) - minY;
	const dx = [0, 1, 0, -1, 1, 1, -1, -1], dy = [-1, 0, 1, 0, -1, 1, 1, -1];
	const queue = new PriorityQueue<[number, number, number]>((a, b) => a[2] < b[2]);
	const costMap = new Uint16Array(width * height);
	const parentMap = new Uint16Array(width * height);
	onNeighborWater(end, tile => {
		queue.push([tile % gameMap.width - minX, Math.floor(tile / gameMap.width) - minY, 0]);
		costMap[tile % gameMap.width - minX + (Math.floor(tile / gameMap.width) - minY) * width] = 1;
		parentMap[tile % gameMap.width - minX + (Math.floor(tile / gameMap.width) - minY) * width] = 1;
	});
	while (!queue.isEmpty()) {
		const [x, y, cost] = queue.pop();
		if (x === startX && y === startY) {
			const path = [];
			let current = startX + startY * width;
			while (current >= 0) {
				path.push(current % width + minX + (Math.floor(current / width) + minY) * gameMap.width);
				current = parentMap[current] - 2;
			}
			if (path.length !== 1) path.pop();
			return path;
		}
		for (let i = 0; i < 8; i++) {
			const nx = x + dx[i], ny = y + dy[i];
			if (nx < 0 || ny < 0 || nx >= width || ny >= height || gameMap.getDistance(nx + minX + (ny + minY) * gameMap.width) >= 0) {
				continue;
			}
			const newCost = cost + 1 + Math.sqrt((nx - startX) * (nx - startX) + (ny - startY) * (ny - startY));
			if (costMap[nx + ny * width] && costMap[nx + ny * width] <= newCost) {
				continue;
			}
			if (i >= 4 && (gameMap.getDistance(x + minX + (ny + minY) * gameMap.width) >= 0 || gameMap.getDistance(nx + minX + (y + minY) * gameMap.width) >= 0)) {
				continue;
			}
			queue.push([nx, ny, newCost]);
			costMap[nx + ny * width] = newCost;
			parentMap[nx + ny * width] = x + y * width + 2;
		}
	}
	return [];
}

/**
 * Finds costs for all nodes in the area.
 * Note: costs are 1-based, 0 means the node cannot be reached.
 * @param start The starting position.
 * @returns costs for all nodes in the area.
 */
function findStartsInArea(start: number) {
	const minX = Math.floor((start % gameMap.width) / areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE;
	const minY = Math.floor(Math.floor(start / gameMap.width) / areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE;
	const height = Math.min(gameMap.height - minY, areaCalculator.AREA_SIZE);
	const dx = [0, 1, 0, -1, 1, 1, -1, -1], dy = [-1, 0, 1, 0, -1, 1, 1, -1];
	const stack = [start % gameMap.width - minX, Math.floor(start / gameMap.width) - minY];
	let stackPointer = 2, queuePointer = 0;
	const distanceMap = new Uint16Array(areaCalculator.AREA_SIZE * height);
	distanceMap[start % gameMap.width - minX + (Math.floor(start / gameMap.width) - minY) * areaCalculator.AREA_SIZE] = 1;
	while (queuePointer < stackPointer) {
		const x = stack[queuePointer++];
		const y = stack[queuePointer++];
		const distance = distanceMap[x + y * areaCalculator.AREA_SIZE];
		for (let i = 0; i < 8; i++) {
			const nx = x + dx[i], ny = y + dy[i];
			if (nx < 0 || ny < 0 || nx >= areaCalculator.AREA_SIZE || ny >= height || distanceMap[nx + ny * areaCalculator.AREA_SIZE] !== 0 || gameMap.getDistance(nx + minX + (ny + minY) * gameMap.width) >= 0) {
				continue;
			}
			if (i >= 4 && (gameMap.getDistance(x + minX + (ny + minY) * gameMap.width) >= 0 || gameMap.getDistance(nx + minX + (y + minY) * gameMap.width) >= 0)) {
				continue;
			}
			distanceMap[nx + ny * areaCalculator.AREA_SIZE] = distance + 1;
			stack[stackPointer++] = nx;
			stack[stackPointer++] = ny;
		}
	}
	return distanceMap;
}

/**
 * Finds a suitable starting point for the pathfinding.
 * Warning: This only works for the local player.
 * @param target The target position.
 * @returns The starting point for the pathfinding or null if none is found.
 */
export function findStartingPoint(target: number): number | null {
	let inSameArea = false;
	onNeighborWater(target, tile => {
		if (territoryManager.playerIndex[areaCalculator.areaIndex[tile]] > 0) {
			inSameArea = true;
		}
	});
	if (inSameArea) {
		return findPlayerTile(target)[0];
	}

	const queue = new PriorityQueue<[Node, number]>((a, b) => a[1] < b[1]);
	const costs = [];
	onNeighborWater(target, tile => {
		const startPoints = findStartsInArea(tile);
		for (const node of areaCalculator.nodeIndex[areaCalculator.areaIndex[tile]]) {
			queue.push([node, startPoints[(node.x % areaCalculator.AREA_SIZE) + (node.y % areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE]]);
			costs[node.id] = startPoints[(node.x % areaCalculator.AREA_SIZE) + (node.y % areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE];
		}
	});
	let found = null, foundCost = Infinity;
	while (!queue.isEmpty()) {
		const [node, cost] = queue.pop();
		if (cost >= foundCost) {
			break;
		}
		if (territoryManager.playerIndex[node.canonicalAreaId] > 0) {
			const [tile, distance] = findPlayerTile(node.x + node.y * gameMap.width);
			if (distance < foundCost) {
				found = tile;
				foundCost = distance;
			}
		}
		for (const edge of node.edges) {
			const newCost = cost + edge.cost;
			if (costs[edge.node.id] && costs[edge.node.id] <= newCost) {
				continue;
			}
			queue.push([edge.node, newCost]);
			costs[edge.node.id] = newCost;
		}
	}
	return found;
}

/**
 * Finds the closest water tile allowing creation of a boat.
 * The territory tile bordering the tile in question does not have to be in the same area.
 * @param start The starting position.
 * @returns The closest water tile and the distance to it.
 * @throws UnsupportedDataException if no suitable tile is found. This should never happen.
 */
function findPlayerTile(start: number): [number, number] {
	const minX = Math.floor((start % gameMap.width) / areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE;
	const minY = Math.floor(Math.floor(start / gameMap.width) / areaCalculator.AREA_SIZE) * areaCalculator.AREA_SIZE;
	const height = Math.min(gameMap.height - minY, areaCalculator.AREA_SIZE), width = Math.min(gameMap.width - minX, areaCalculator.AREA_SIZE);
	const dx = [0, 1, 0, -1, 1, 1, -1, -1], dy = [-1, 0, 1, 0, -1, 1, 1, -1];
	const stack = [(start % gameMap.width) - minX, Math.floor(start / gameMap.width) - minY];
	let stackPointer = 2, queuePointer = 0;
	const distanceMap = new Uint16Array(width * height);
	distanceMap[(start % gameMap.width) - minX + Math.floor(start / gameMap.width) * width] = 1;
	while (queuePointer < stackPointer) {
		const x = stack[queuePointer++];
		const y = stack[queuePointer++];
		const distance = distanceMap[x + y * width];
		for (let i = 0; i < 8; i++) {
			const nx = x + dx[i], ny = y + dy[i];
			if (i <= 4 && territoryManager.isOwner(nx + minX + (ny + minY) * gameMap.width, clientPlayer.id)) {
				return [x + minX + (y + minY) * gameMap.width, distance];
			}
			if (nx < 0 || ny < 0 || nx >= width || ny >= height || distanceMap[nx + ny * width] !== 0 || gameMap.getDistance(nx + minX + (ny + minY) * gameMap.width) >= 0) {
				continue;
			}
			if (i >= 4 && (gameMap.getDistance(x + minX + (ny + minY) * gameMap.width) >= 0 || gameMap.getDistance(nx + minX + (y + minY) * gameMap.width) >= 0)) {
				continue;
			}
			distanceMap[nx + ny * width] = distance + 1;
			stack[stackPointer++] = nx;
			stack[stackPointer++] = ny;
		}
	}
	throw new UnsupportedDataException("No suitable tile found");
}

/**
 * Calls the closure for all water tiles neighboring the given tile (including the tile itself).
 * @param tile The tile to check.
 * @param closure The closure to call.
 */
function onNeighborWater(tile: number, closure: (tile: number) => void) {
	const x = tile % gameMap.width, y = Math.floor(tile / gameMap.width);
	for (let i = 0; i < 5; i++) {
		const checkX = x + [0, 0, 0, -1, 1][i];
		const checkY = y + [-1, 1, 0, 0, 0][i];
		if (checkX < 0 || checkY < 0 || checkX >= gameMap.width || checkY >= gameMap.height || gameMap.getDistance(checkX + checkY * gameMap.width) >= 0) {
			continue;
		}
		closure(checkX + checkY * gameMap.width);
	}
}