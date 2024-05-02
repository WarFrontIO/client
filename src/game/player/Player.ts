import {territoryManager} from "../TerritoryManager";
import {territoryRenderer} from "../../renderer/layer/TerritoryRenderer";
import {gameMap} from "../Game";
import {getNeighbors} from "../../util/MathUtil";
import {PlayerNameRenderingData, playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";
import {attackActionHandler} from "../action/AttackActionHandler";

//TODO: This needs major refactoring
// rendering logic should be separated from the game logic
export class Player {
	readonly id: number;
	readonly name: string;
	troops: number = 1000;
	readonly borderTiles: Set<number> = new Set();
	territorySize: number = 0;
	readonly nameRenderingData: PlayerNameRenderingData;

	constructor(id: number, name: string, r: number, g: number, b: number) {
		this.id = id;
		this.name = name;
		this.territoryR = r;
		this.territoryG = g;
		this.territoryB = b;
		this.borderR = r < 128 ? r + 32 : r - 32;
		this.borderG = g < 128 ? g + 32 : g - 32;
		this.borderB = b < 128 ? b + 32 : b - 32;
		this.nameRenderingData = playerNameRenderingManager.registerPlayer(this);
	}

	territoryR: number = 0;
	territoryG: number = 0;
	territoryB: number = 0;
	borderR: number = 0;
	borderG: number = 0;
	borderB: number = 0;

	addTile(tile: number): void {
		this.territorySize++;
		if (territoryManager.isBorder(tile)) {
			this.borderTiles.add(tile);
			territoryRenderer.set(tile, this.borderR, this.borderG, this.borderB);
		} else {
			playerNameRenderingManager.addTile(tile, this.id);
			territoryRenderer.set(tile, this.territoryR, this.territoryG, this.territoryB);
		}
		for (const neighbor of getNeighbors(tile)) {
			if (territoryManager.isOwner(neighbor, this.id) && !territoryManager.isBorder(neighbor) && this.borderTiles.delete(neighbor)) {
				territoryRenderer.set(neighbor, this.territoryR, this.territoryG, this.territoryB);
				playerNameRenderingManager.addTile(neighbor, this.id);
			}
		}

		attackActionHandler.handleTerritoryAdd(tile, this.id);
	}

	removeTile(tile: number): void {
		this.territorySize--;
		if (!this.borderTiles.delete(tile)) {
			playerNameRenderingManager.removeTile(tile, this.id);
		}
		for (const neighbor of getNeighbors(tile)) {
			if (territoryManager.isOwner(neighbor, this.id) && !this.borderTiles.has(neighbor)) {
				this.borderTiles.add(neighbor);
				territoryRenderer.set(neighbor, this.borderR, this.borderG, this.borderB);
				playerNameRenderingManager.removeTile(neighbor, this.id);
			}
		}

		attackActionHandler.handleTerritoryRemove(tile, this.id);
	}

	income() {
		this.troops += Math.max(1, Math.floor(this.territorySize / 50) + Math.floor(this.troops / 30));
		this.troops = Math.min(this.territorySize * 100, this.troops);
	}
}