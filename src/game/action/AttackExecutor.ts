import {Player} from "../player/Player";
import {PriorityQueue} from "../../util/PriorityQueue";
import {territoryManager} from "../../map/TerritoryManager";
import {gameMap} from "../Game";
import {random} from "../Random";
import {attackActionHandler} from "./AttackActionHandler";
import {territoryRenderingManager} from "../../renderer/manager/TerritoryRenderingManager";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";

export class AttackExecutor {
	readonly player: Player;
	readonly target: Player | null;
	private troops: number;
	private tileQueue: PriorityQueue<[number, number]> = new PriorityQueue((a, b) => a[0] < b[0]);
	private basePriority: number = 0;

	/**
	 * Create a new attack executor.
	 * @param player The player that is attacking.
	 * @param target The player that is being attacked, or null if the target is unclaimed territory.
	 * @param troops The amount of troops that are attacking.
	 */
	constructor(player: Player, target: Player | null, troops: number) {
		this.player = player;
		this.target = target;
		this.troops = troops;
		this.orderTiles();
	}

	/**
	 * Modify the amount of troops in the attack.
	 * @param amount The amount to modify the troops by.
	 */
	modifyTroops(amount: number): void {
		this.troops += amount;
	}

	/**
	 * Oppose an attack on the player.
	 * @param troopCount The amount of troops that are opposing the attack.
	 * @returns Whether the attack is still ongoing.
	 */
	oppose(troopCount: number): boolean {
		if (this.troops > troopCount) {
			this.troops -= troopCount;
			return true;
		}
		return false;
	}

	/**
	 * Get the amount of troops in the attack.
	 * The troop count decreases as the attack progresses.
	 * @returns The amount of troops in the attack.
	 */
	getTroops(): number {
		return this.troops;
	}

	/**
	 * Tick the attack executor.
	 * @returns Whether the attack is still ongoing.
	 */
	tick(): boolean {
		const attackCost = this.calculateAttackCost();
		const defenseCost = Math.ceil((1 + attackCost) / 2);

		let conquered = 0;
		while (this.troops >= attackCost && !this.tileQueue.isEmpty() && this.tileQueue.peek()[0] < this.basePriority) {
			const [_, tile] = this.tileQueue.pop();
			if (!territoryManager.isOwner(tile, this.target ? this.target.id : territoryManager.OWNER_NONE)) continue;
			if (!territoryManager.bordersTile(tile, this.player.id)) continue;
			territoryManager.conquer(tile, this.player.id);

			this.troops -= attackCost + gameMap.tileExpansionCosts[tile] / 50;
			conquered++;
		}

		territoryRenderingManager.applyTransaction(this.player, this.target || this.player);
		playerNameRenderingManager.applyTransaction(this.player, this.target || this.player);

		if (this.target) this.target.removeTroops(conquered * defenseCost);

		if (this.tileQueue.isEmpty() || this.troops < attackCost) return false;

		this.basePriority += this.calculateSpeedFactor();
		return true;
	}

	/**
	 * Handle the addition of a tile to the player's territory.
	 * Called when a new tile is added to the player's territory (including by this attack).
	 * @param tile The tile that was added.
	 */
	handlePlayerTileAdd(tile: number) {
		territoryManager.onNeighbors(tile, neighbor => {
			if (territoryManager.isOwner(neighbor, this.target ? this.target.id : territoryManager.OWNER_NONE)) {
				this.tileQueue.push([this.basePriority + gameMap.tileExpansionTimes[tile] * (0.025 + random.next() * 0.06), neighbor]);
			}
		});
	}

	/**
	 * Handle the addition of a tile to the target's territory.
	 * Called when a new tile is added to the target's territory.
	 * @param tile The tile that was added.
	 */
	handleTargetTileAdd(tile: number) {
		if (territoryManager.bordersTile(tile, this.player.id)) {
			this.tileQueue.push([this.basePriority + gameMap.tileExpansionTimes[tile] * (0.025 + random.next() * 0.06), tile]);
		}
	}

	/**
	 * Build the initial tile queue.
	 * @private
	 */
	private orderTiles(): void {
		const tileOwners = territoryManager.tileOwners;
		const target = this.target ? this.target.id : territoryManager.OWNER_NONE;

		const result = [];
		const amountCache = attackActionHandler.amountCache;
		for (const tile of this.player.borderTiles) {
			const x = tile % gameMap.width;
			const y = Math.floor(tile / gameMap.width);
			if (x > 0 && tileOwners[tile - 1] === target) {
				!amountCache[tile - 1] && result.push(tile - 1);
				amountCache[tile - 1]++;
			}
			if (x < gameMap.width - 1 && tileOwners[tile + 1] === target) {
				!amountCache[tile + 1] && result.push(tile + 1);
				amountCache[tile + 1]++;
			}
			if (y > 0 && tileOwners[tile - gameMap.width] === target) {
				!amountCache[tile - gameMap.width] && result.push(tile - gameMap.width);
				amountCache[tile - gameMap.width]++;
			}
			if (y < gameMap.height - 1 && tileOwners[tile + gameMap.width] === target) {
				!amountCache[tile + gameMap.width] && result.push(tile + gameMap.width);
				amountCache[tile + gameMap.width]++;
			}
		}

		for (const tile of result) {
			const priority = 4 - amountCache[tile] + random.next() * 3;
			amountCache[tile] = 0;
			this.tileQueue.push([gameMap.tileExpansionTimes[tile] * priority / 50, tile]);
		}
	}

	/**
	 * Calculate the speed factor of the attack.
	 * The speed factor is a value between that determines how fast the attack progresses, higher values mean faster attacks.
	 * @returns The speed factor of the attack.
	 * @private
	 */
	private calculateSpeedFactor(): number {
		if (!this.target) return 1;
		return 0.65 + Math.log(1 + Math.min(50, this.player.getTerritorySize() * this.player.getTroops() / Math.max(1, this.target.getTerritorySize()) / Math.max(1, this.target.getTroops()))) / 2;
	}

	/**
	 * Calculate the cost of attacking the target.
	 * The cost is the amount of troops that are required to conquer a single pixel of the target's territory.
	 * This does not include the base cost of conquering a tile.
	 * @returns The cost of attacking the target.
	 * @private
	 */
	private calculateAttackCost() {
		if (!this.target) return 0;
		return Math.min(20, Math.floor(this.target.getTroops() / Math.max(1, this.player.getTroops()) * 3));
	}
}