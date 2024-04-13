import {gameMap} from "./Game";
import {playerManager} from "./player/PlayerManager";
import {territoryRenderer} from "../renderer/layer/TerritoryRenderer";
import {tileManager} from "../Loader";

class TerritoryManager {
	tileOwners: Uint16Array;
	readonly OWNER_NONE = 65535;

	reset(): void {
		this.tileOwners = new Uint16Array(gameMap.width * gameMap.height);
		for (let i = 0; i < this.tileOwners.length; i++) {
			this.tileOwners[i] = gameMap.getTile(i % gameMap.width, Math.floor(i / gameMap.width)).isSolid ? this.OWNER_NONE : this.OWNER_NONE - 1;
		}
	}

	isBorder(tile: number): boolean {
		let x = tile % gameMap.width;
		let y = Math.floor(tile / gameMap.width);
		let owner = this.tileOwners[tile];
		return x === 0 || x === gameMap.width - 1 || y === 0 || y === gameMap.height - 1 ||
			this.tileOwners[tile - 1] !== owner || this.tileOwners[tile + 1] !== owner ||
			this.tileOwners[tile - gameMap.width] !== owner || this.tileOwners[tile + gameMap.width] !== owner;
	}

	hasOwner(tile: number): boolean {
		return this.tileOwners[tile] !== this.OWNER_NONE;
	}

	isOwner(tile: number, owner: number): boolean {
		return this.tileOwners[tile] === owner;
	}

	getOwner(tile: number): number {
		return this.tileOwners[tile];
	}

	conquer(tile: number, owner: number): void {
		const previousOwner = this.tileOwners[tile];
		this.tileOwners[tile] = owner;
		if (previousOwner !== this.OWNER_NONE) {
			playerManager.getPlayer(previousOwner).removeTile(tile);
		}
		playerManager.getPlayer(owner).addTile(tile);
	}

	clear(tile: number): void {
		const owner = this.tileOwners[tile];
		if (owner !== this.OWNER_NONE) {
			this.tileOwners[tile] = this.OWNER_NONE;
			playerManager.getPlayer(owner).removeTile(tile);
			territoryRenderer.clear(tile);
		}
	}
}

export const territoryManager = new TerritoryManager();