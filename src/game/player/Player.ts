import {territoryManager} from "../TerritoryManager";
import {onNeighbors} from "../../util/MathUtil";
import {attackActionHandler} from "../attack/AttackActionHandler";
import {HSLColor} from "../../util/HSLColor";
import {gameMode} from "../GameData";
import {spawnManager} from "./SpawnManager";

export class Player {
	readonly id: number;
	readonly name: string;
	readonly baseColor: HSLColor;
	private troops: number = 1000;
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
	 * @internal
	 */
	addTile(tile: number): void {
		this.territorySize++;
		onNeighbors(tile, neighbor => {
			if (territoryManager.isWater(neighbor)) {
				this.waterTiles++;
			}
		});

		attackActionHandler.handleTerritoryAdd(tile, this.id);
	}

	/**
	 * Remove a tile from the player's territory.
	 * WARNING: Make sure to call this method AFTER updating the territory manager.
	 * @param tile The tile to remove
	 * @internal
	 */
	removeTile(tile: number): void {
		this.territorySize--;
		onNeighbors(tile, neighbor => {
			if (territoryManager.isWater(neighbor)) {
				this.waterTiles--;
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
		this.addTroops(Math.max(1, Math.floor(this.territorySize / 10) + Math.floor(Math.pow(3 / 5, 1 - Math.log(this.troops) / Math.LN2))));
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