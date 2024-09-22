import {territoryManager} from "../TerritoryManager";
import {onNeighbors} from "../../util/MathUtil";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";
import {attackActionHandler} from "../attack/AttackActionHandler";
import {HSLColor} from "../../util/HSLColor";
import {gameMode} from "../GameData";
import {spawnManager} from "./SpawnManager";
import {TerritoryTransaction} from "../transaction/TerritoryTransaction";

export class Player {
	readonly id: number;
	readonly name: string;
	readonly baseColor: HSLColor;
	private troops: number = 1000;
	readonly borderTiles: Set<number> = new Set();
	private territorySize: number = 0;
	private alive: boolean = true;
	protected waterTiles = 0;

	constructor(id: number, name: string, baseColor: HSLColor) {
		this.id = id;
		this.name = name;
		this.baseColor = gameMode.processPlayerColor(id, baseColor);
	}

	/**
	 * Add a tile to the player's territory.
	 * WARNING: Make sure to call this method AFTER updating the territory manager.
	 * @param tile The tile to add
	 * @param transaction The transaction to update the tile in
	 * @internal
	 */
	addTile(tile: number, transaction: TerritoryTransaction): void {
		this.territorySize++;
		if (territoryManager.isBorder(tile)) {
			this.borderTiles.add(tile);
			transaction.setBorder(tile);
		} else {
			transaction.setTerritory(tile);
			playerNameRenderingManager.addTile(tile, transaction);
		}
		onNeighbors(tile, neighbor => {
			if (territoryManager.isWater(neighbor)) {
				this.waterTiles++;
			} else if (territoryManager.isOwner(neighbor, this.id) && !territoryManager.isBorder(neighbor) && this.borderTiles.delete(neighbor)) {
				transaction.setTerritory(neighbor);
				playerNameRenderingManager.addTile(neighbor, transaction);
			}
		});

		attackActionHandler.handleTerritoryAdd(tile, this.id);
	}

	/**
	 * Remove a tile from the player's territory.
	 * WARNING: Make sure to call this method AFTER updating the territory manager.
	 * @param tile The tile to remove
	 * @param transaction The transaction to update the tile in
	 * @internal
	 */
	removeTile(tile: number, transaction: TerritoryTransaction): void {
		this.territorySize--;
		if (!this.borderTiles.delete(tile)) {
			playerNameRenderingManager.removeTile(tile, transaction);
		}
		onNeighbors(tile, neighbor => {
			if (territoryManager.isWater(neighbor)) {
				this.waterTiles--;
			} else if (territoryManager.isOwner(neighbor, this.id) && !this.borderTiles.has(neighbor)) {
				this.borderTiles.add(neighbor);
				transaction.setDefendantBorder(neighbor);
				playerNameRenderingManager.removeTile(neighbor, transaction);
			}
		});

		if (this.territorySize === 0 && !spawnManager.isSelecting) {
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