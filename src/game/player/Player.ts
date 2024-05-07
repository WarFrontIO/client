import {territoryManager} from "../TerritoryManager";
import {territoryRenderer} from "../../renderer/layer/TerritoryRenderer";
import {onNeighbors} from "../../util/MathUtil";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";
import {attackActionHandler} from "../action/AttackActionHandler";

export class Player {
	readonly id: number;
	readonly name: string;
	private troops: number = 1000;
	readonly borderTiles: Set<number> = new Set();
	private territorySize: number = 0;
	private alive: boolean = true;

	constructor(id: number, name: string, r: number, g: number, b: number) {
		this.id = id;
		this.name = name;
		this.territoryR = r;
		this.territoryG = g;
		this.territoryB = b;
		this.borderR = r < 128 ? r + 32 : r - 32;
		this.borderG = g < 128 ? g + 32 : g - 32;
		this.borderB = b < 128 ? b + 32 : b - 32;
	}

	//TODO: remove this
	territoryR: number = 0;
	territoryG: number = 0;
	territoryB: number = 0;
	borderR: number = 0;
	borderG: number = 0;
	borderB: number = 0;

	/**
	 * Add a tile to the player's territory.
	 * WARNING: Make sure to call this method AFTER updating the territory manager.
	 * @param tile
	 * @internal
	 */
	addTile(tile: number): void {
		this.territorySize++;
		if (territoryManager.isBorder(tile)) {
			this.borderTiles.add(tile);
			territoryRenderer.set(tile, this.borderR, this.borderG, this.borderB);
		} else {
			playerNameRenderingManager.addTile(tile, this.id);
			territoryRenderer.set(tile, this.territoryR, this.territoryG, this.territoryB);
		}
		onNeighbors(tile, neighbor => {
			if (territoryManager.isOwner(neighbor, this.id) && !territoryManager.isBorder(neighbor) && this.borderTiles.delete(neighbor)) {
				territoryRenderer.set(neighbor, this.territoryR, this.territoryG, this.territoryB);
				playerNameRenderingManager.addTile(neighbor, this.id);
			}
		});

		attackActionHandler.handleTerritoryAdd(tile, this.id);
	}

	/**
	 * Remove a tile from the player's territory.
	 * WARNING: Make sure to call this method AFTER updating the territory manager.
	 * @param tile The tile to remove.
	 * @internal
	 */
	removeTile(tile: number): void {
		this.territorySize--;
		if (!this.borderTiles.delete(tile)) {
			playerNameRenderingManager.removeTile(tile, this.id);
		}
		onNeighbors(tile, neighbor => {
			if (territoryManager.isOwner(neighbor, this.id) && !this.borderTiles.has(neighbor)) {
				this.borderTiles.add(neighbor);
				territoryRenderer.set(neighbor, this.borderR, this.borderG, this.borderB);
				playerNameRenderingManager.removeTile(neighbor, this.id);
			}
		});

		attackActionHandler.handleTerritoryRemove(tile, this.id);

		if (this.territorySize === 0) {
			this.alive = false;
		}
	}

	/**
	 * Process one tick worth of income.
	 */
	income() {
		this.addTroops(Math.max(1, Math.floor(this.territorySize / 50) + Math.floor(this.getTroops() / 30)));
	}

	/**
	 * @returns The amount of troops the player has.
	 */
	getTroops(): number {
		return this.troops;
	}

	/**
	 * Add troops to the player.
	 * Troops will be capped at 100 times the territory size.
	 * @param amount The amount of troops to add.
	 */
	addTroops(amount: number) {
		this.troops = Math.min(this.territorySize * 100, this.troops + amount);
	}

	/**
	 * Remove troops from the player.
	 * @param amount The amount of troops to remove.
	 */
	removeTroops(amount: number) {
		this.troops = Math.max(0, this.troops - amount);
	}

	/**
	 * @returns The size of the player's territory (in tiles).
	 */
	getTerritorySize(): number {
		return this.territorySize;
	}

	/**
	 * @returns True if the player is alive, false otherwise.
	 */
	isAlive(): boolean {
		return this.alive;
	}
}