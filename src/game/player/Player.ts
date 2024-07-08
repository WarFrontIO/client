import { TerritoryManager } from "../TerritoryManager";
import { onNeighbors } from "../../util/MathUtil";
import { PlayerNameRenderingManager } from "../../renderer/manager/PlayerNameRenderingManager";
import { AttackActionHandler } from "../action/AttackActionHandler";
import { HSLColor } from "../../util/HSLColor";
import { TerritoryRenderingManager } from "../../renderer/manager/TerritoryRenderingManager";
import { Game } from "../Game";
import { GameMap } from "../../map/GameMap";
import { GameRenderer } from "../../renderer/GameRenderer";

export class Player {
	readonly id: number;
	readonly name: string;
	readonly baseColor: HSLColor;
	private troops: number = 1000;
	readonly borderTiles: Set<number> = new Set();
	private territorySize: number = 0;
	private alive: boolean = true;

	protected game: Game
	protected gameRenderer: GameRenderer
	protected territoryManager: TerritoryManager
	protected attackActionHandler: AttackActionHandler

	constructor(attackActionHandler: AttackActionHandler, game: Game, territoryManager: TerritoryManager, gameRenderer: GameRenderer, id: number, name: string, baseColor: HSLColor) {
		this.attackActionHandler = attackActionHandler
		this.game = game
		this.id = id;
		this.name = name;
		this.gameRenderer = gameRenderer
		this.territoryManager = territoryManager
		this.baseColor = game.mode.processPlayerColor(id, baseColor);
	}

	/**
	 * Add a tile to the player's territory.
	 * WARNING: Make sure to call this method AFTER updating the territory manager.
	 * @param tile
	 * @internal
	 */
	addTile(tile: number): void {
		this.territorySize++;
		if (this.territoryManager.isBorder(tile)) {
			this.borderTiles.add(tile);
			this.gameRenderer.territoryRenderingManager.setPlayerBorder(tile);
		} else {
			this.gameRenderer.playerNameRenderingManager.addTile(tile);
			this.gameRenderer.territoryRenderingManager.setTerritory(tile);
		}
		onNeighbors(tile, neighbor => {
			if (this.territoryManager.isOwner(neighbor, this.id) && !this.territoryManager.isBorder(neighbor) && this.borderTiles.delete(neighbor)) {
				this.gameRenderer.territoryRenderingManager.setTerritory(neighbor);
				this.gameRenderer.playerNameRenderingManager.addTile(neighbor);
			}
		}, this.game.map.width, this.game.map.height);

		this.attackActionHandler.handleTerritoryAdd(tile, this.id);
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
			this.gameRenderer.playerNameRenderingManager.removeTile(tile);
		}
		onNeighbors(tile, neighbor => {
			if (this.territoryManager.isOwner(neighbor, this.id) && !this.borderTiles.has(neighbor)) {
				this.borderTiles.add(neighbor);
				this.gameRenderer.territoryRenderingManager.setTargetBorder(neighbor);
				this.gameRenderer.playerNameRenderingManager.removeTile(neighbor);
			}
		}, this.game.map.width, this.game.map.height);

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