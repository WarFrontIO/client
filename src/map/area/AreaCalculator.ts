import {territoryManager} from "../../game/TerritoryManager";
import {gameMap} from "../../game/GameData";

class AreaCalculator {
	readonly AREA_SIZE = 50;
	private graph: Area[]; //Temporary storage for the areas
	nodeIndex: Node[][];
	areaIndex: Uint16Array;
	isLoaded = false;

	/**
	 * Preprocesses the map into areas.
	 */
	preprocessMap(): number {
		this.isLoaded = true;
		this.graph = [];
		this.nodeIndex = [[]];
		this.areaIndex = new Uint16Array(gameMap.width * gameMap.height);
		currentNodeId = 0;
		canonicalAreaId = 1;
		this.createAreas();
		for (let i = 0; i < this.graph.length; i++) {
			const area = this.graph[i];
			//We only need to check up and left since we only want each pair once.
			this.checkConnections(area, area.x - this.AREA_SIZE, area.y);
			this.checkConnections(area, area.x, area.y - this.AREA_SIZE);

			const topLeft = area.nodes.find(node => node.x === area.x && node.y === area.y);
			const topRight = this.graph[i - 1]?.nodes.find(node => node.x === area.x - 1 && node.y === area.y);
			const bottomLeft = this.graph[i - Math.ceil(gameMap.width / this.AREA_SIZE)]?.nodes.find(node => node.x === area.x && node.y === area.y - 1);
			const bottomRight = this.graph[i - Math.ceil(gameMap.width / this.AREA_SIZE) - 1]?.nodes.find(node => node.x === area.x - 1 && node.y === area.y - 1);
			if (topLeft && topRight && bottomLeft && bottomRight) {
				topLeft.edges.push({node: bottomRight, cost: 1.5, cache: [bottomRight.x + bottomRight.y * gameMap.width]});
				topRight.edges.push({node: bottomLeft, cost: 1.5, cache: [bottomLeft.x + bottomLeft.y * gameMap.width]});
				bottomLeft.edges.push({node: topRight, cost: 1.5, cache: [topRight.x + topRight.y * gameMap.width]});
				bottomRight.edges.push({node: topLeft, cost: 1.5, cache: [topLeft.x + topLeft.y * gameMap.width]});
			}
		}
		this.buildAreaGraph();
		this.graph = []; //no longer needed
		return canonicalAreaId;
	}

	/**
	 * Creates areas for a specific level.
	 */
	createAreas(): void {
		const areas: Area[] = [];
		for (let y = 0; y < gameMap.height; y += this.AREA_SIZE) {
			for (let x = 0; x < gameMap.width; x += this.AREA_SIZE) {
				areas.push(new Area(x, y));
			}
		}
		this.graph = areas;
	}

	/**
	 * Checks if two areas are connected and adds an edge if they are connected.
	 * @param area The area to check.
	 * @param otherX The x-coordinate of the other area.
	 * @param otherY The y-coordinate of the other area.
	 */
	checkConnections(area: Area, otherX: number, otherY: number): void {
		if (otherX < 0 || otherY < 0) {
			return;
		}
		const x = area.x;
		const y = area.y;
		const map = territoryManager.tileOwners;
		const allowed = territoryManager.OWNER_NONE - 1;
		const other = this.graph[Math.floor(otherX / this.AREA_SIZE) + Math.floor(otherY / this.AREA_SIZE) * Math.ceil(gameMap.width / this.AREA_SIZE)];
		let entranceStart = -1;
		if (area.x - otherX === 0) {
			for (let i = 0; i < this.AREA_SIZE; i++) {
				if (x + i < gameMap.width && map[x + i + y * gameMap.width] === allowed && map[x + i + (y - 1) * gameMap.width] === allowed) {
					if (entranceStart === -1) {
						entranceStart = i;
					}
				} else if (entranceStart !== -1) {
					if (i - entranceStart >= 6) {
						this.addEdge(area, other, x + entranceStart, y, x + entranceStart, y - 1);
						this.addEdge(area, other, x + i - 1, y, x + i - 1, y - 1);
					} else {
						this.addEdge(area, other, x + Math.floor((i - 1 + entranceStart) / 2), y, x + Math.floor((i - 1 + entranceStart) / 2), y - 1);
					}
					entranceStart = -1;
				}
			}
			if (entranceStart !== -1) {
				if (this.AREA_SIZE - entranceStart >= 6) {
					this.addEdge(area, other, x + entranceStart, y, x + entranceStart, y - 1);
					this.addEdge(area, other, x + this.AREA_SIZE - 1, y, x + this.AREA_SIZE - 1, y - 1);
				} else {
					this.addEdge(area, other, x + Math.floor((this.AREA_SIZE - 1 + entranceStart) / 2), y, x + Math.floor((this.AREA_SIZE - 1 + entranceStart) / 2), y - 1);
				}
			}
		} else if (area.y - otherY === 0) {
			for (let i = 0; i < this.AREA_SIZE; i++) {
				if (y + i < gameMap.height && map[x + (y + i) * gameMap.width] === allowed && map[x + (y + i) * gameMap.width - 1] === allowed) {
					if (entranceStart === -1) {
						entranceStart = i;
					}
				} else if (entranceStart !== -1) {
					if (i - entranceStart >= 6) {
						this.addEdge(area, other, x, y + entranceStart, x - 1, y + entranceStart);
						this.addEdge(area, other, x, y + i - 1, x - 1, y + i - 1);
					} else {
						this.addEdge(area, other, x, y + Math.floor((i - 1 + entranceStart) / 2), x - 1, y + Math.floor((i - 1 + entranceStart) / 2));
					}
					entranceStart = -1;
				}
			}
			if (entranceStart !== -1) {
				if (this.AREA_SIZE - entranceStart >= 6) {
					this.addEdge(area, other, x, y + entranceStart, x - 1, y + entranceStart);
					this.addEdge(area, other, x, y + this.AREA_SIZE - 1, x - 1, y + this.AREA_SIZE - 1);
				} else {
					this.addEdge(area, other, x, y + Math.floor((this.AREA_SIZE - 1 + entranceStart) / 2), x - 1, y + Math.floor((this.AREA_SIZE - 1 + entranceStart) / 2));
				}
			}
		}
	}

	/**
	 * Adds an edge between two areas.
	 */
	private addEdge(area1: Area, area2: Area, x1: number, y1: number, x2: number, y2: number) {
		const node1 = this.getOrCreateNode(area1, x1, y1);
		const node2 = this.getOrCreateNode(area2, x2, y2);
		node1.edges.push({node: node2, cost: 1, cache: [node2.x + node2.y * gameMap.width]});
		node2.edges.push({node: node1, cost: 1, cache: [node1.x + node1.y * gameMap.width]});
	}

	/**
	 * Gets or creates a node at a specific position.
	 * @param area The area to get or create the node in.
	 * @param x The x-coordinate of the node.
	 * @param y The y-coordinate of the node.
	 * @returns The node at the position.
	 */
	private getOrCreateNode(area: Area, x: number, y: number): Node {
		for (const node of area.nodes) {
			if (node.x === x && node.y === y) {
				return node;
			}
		}
		const node = new Node(x, y);
		area.nodes.push(node);
		return node;
	}

	/**
	 * Creates graphs on a per-area basis.
	 */
	private buildAreaGraph(): void {
		for (const area of this.graph) {
			if (this.isAreaEmpty(area)) { //some tiles are just empty, so we can skip them
				const id = canonicalAreaId++;
				this.nodeIndex[id] = [];
				for (let i = 0; i < area.nodes.length; i++) {
					const node = area.nodes[i];
					node.canonicalAreaId = id;
					this.nodeIndex[id].push(node);
					for (let j = i + 1; j < area.nodes.length; j++) {
						const cost = node.x === area.nodes[j].x || node.y === area.nodes[j].y ? this.AREA_SIZE - 1 : 1.5 * (this.AREA_SIZE - 1);
						node.edges.push({node: area.nodes[j], cost, cache: [area.nodes[j].x + area.nodes[j].y * gameMap.width]});
						area.nodes[j].edges.push({node, cost, cache: [node.x + node.y * gameMap.width]});
					}
				}
				for (let x = area.x; x < Math.min(area.x + this.AREA_SIZE, gameMap.width); x++) {
					for (let y = area.y; y < Math.min(area.y + this.AREA_SIZE, gameMap.height * gameMap.width); y++) {
						this.areaIndex[x + y * gameMap.width] = id;
					}
				}
				continue;
			}
			for (let i = 0; i < area.nodes.length; i++) {
				this.calculateDistancesRaw(area.nodes[i], area.nodes, area.x, area.y, Math.min(this.AREA_SIZE, gameMap.width - area.x), Math.min(this.AREA_SIZE, gameMap.height - area.y));
			}
		}
	}

	/**
	 * Calculates the distance starting from one node to others.
	 * Just a simple flood fill.
	 * @param node The node to start from.
	 * @param others The other nodes to calculate the distance to.
	 * @param minX The minimum x-coordinate.
	 * @param minY The minimum y-coordinate.
	 * @param width The width of the area.
	 * @param height The height of the area.
	 */
	private calculateDistancesRaw(node: Node, others: Node[], minX: number, minY: number, width: number, height: number): void {
		const isSetting = node.canonicalAreaId === undefined;
		if (isSetting) {
			node.canonicalAreaId = canonicalAreaId++;
			this.areaIndex[node.x + node.y * gameMap.width] = node.canonicalAreaId;
			this.nodeIndex[node.canonicalAreaId] = [node];
		}
		const id = node.canonicalAreaId;
		const dx = [1, -1, 0, 0, 1, -1, 1, -1], dy = [0, 0, 1, -1, 1, 1, -1, -1];
		const stack = [node.x - minX, node.y - minY];
		let stackPointer = 2, queuePointer = 0;
		const parentMap = new Uint16Array(width * height);
		parentMap[node.x - minX + (node.y - minY) * width] = 1;
		while (queuePointer < stackPointer) {
			const x = stack[queuePointer++];
			const y = stack[queuePointer++];
			for (let i = 0; i < 8; i++) {
				const nx = x + dx[i], ny = y + dy[i];
				if (nx < 0 || ny < 0 || nx >= width || ny >= height || parentMap[nx + ny * width] !== 0 || gameMap.getDistance(nx + minX + (ny + minY) * gameMap.width) >= 0) {
					continue;
				}
				if (i >= 4 && (gameMap.getDistance(x + minX + (ny + minY) * gameMap.width) >= 0 || gameMap.getDistance(nx + minX + (y + minY) * gameMap.width) >= 0)) {
					continue;
				}
				if (isSetting) {
					this.areaIndex[nx + minX + (ny + minY) * gameMap.width] = id;
				}

				parentMap[nx + ny * width] = x + y * width + 2;
				stack[stackPointer++] = nx;
				stack[stackPointer++] = ny;
			}
		}
		for (const other of others) {
			if (other === node) {
				continue;
			}
			const path = [];
			let current = other.x - minX + (other.y - minY) * width;
			let distance = 0;
			while (current >= 0) {
				path.push(current % width + minX + (Math.floor(current / width) + minY) * gameMap.width);
				const lastX = current % width, lastY = Math.floor(current / width);
				current = parentMap[current] - 2;
				distance += lastX === current % width || lastY === Math.floor(current / width) ? 1 : 1.5;
			}
			path.pop();
			if (path.length <= 0) {
				continue;
			}
			other.canonicalAreaId = id;
			node.edges.push({node: other, cost: distance + this.AREA_SIZE / 2, cache: path}); //increase cost to prefer open water paths
			this.nodeIndex[id].push(other);
		}
	}

	/**
	 * Checks if an area only contains non-solid tiles.
	 * @param area The area to check.
	 * @returns True if the area is empty, false otherwise.
	 */
	private isAreaEmpty(area: Area): boolean {
		const map = territoryManager.tileOwners;
		const allowed = territoryManager.OWNER_NONE - 1;
		for (let y = area.y; y < area.y + this.AREA_SIZE; y++) {
			for (let x = area.x; x < area.x + this.AREA_SIZE; x++) {
				if (x < gameMap.width && y < gameMap.height && map[x + y * gameMap.width] !== allowed) {
					return false;
				}
			}
		}
		return true;
	}
}

export const areaCalculator = new AreaCalculator();

let canonicalAreaId = 1; //0 is reserved for empty areas

export class Area {
	/**
	 * Warning: These are not the actual coordinates of the area, but the slot in the area grid that the area is in.
	 * Multiple areas can have the same x and y coordinates if they are in the same slot and unreachable from each other.
	 */
	x: number;
	y: number;
	nodes: Node[] = [];

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

let currentNodeId = 0;

export class Node {
	x: number;
	y: number;
	level: number = 0;
	/** Warning: The cache is reversed and excludes this node */
	edges: { node: Node, cost: number, cache: number[] }[] = [];
	id = currentNodeId++;
	canonicalAreaId: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}