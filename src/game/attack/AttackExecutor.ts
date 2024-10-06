import {Player} from "../player/Player";
import {territoryManager} from "../TerritoryManager";
import {bordersTile, onNeighbors} from "../../util/MathUtil";
import {random} from "../Random";
import {attackActionHandler} from "./AttackActionHandler";
import {gameMap} from "../GameData";
import {PlayerTerritoryTransaction} from "../transaction/PlayerTerritoryTransaction";
import {TerritoryTransaction} from "../transaction/TerritoryTransaction";

/**
 * This is the max amount of ticks it can take to conquer a tile.
 * It can be calculated as follows:
 * 1. The maximum speed factor is 2 / 0.325
 * 2. The maximum tile expansion time is 255
 * 3. The maximum multiplier is (0.025 + 0.06)
 * -> ceil(255 * 2 / 0.325 * (0.025 + 0.06)) = 134
 */
const MAX_ATTACK_SCHEDULE = 134 + 1;

//TODO: Replace per-player data structures with proper transaction handling (this would allow handling tiles out of player order)
export class AttackExecutor {
	private readonly transaction: TerritoryTransaction;
	readonly player: Player;
	readonly target: Player | null;
	private troops: number;
	private readonly tileQueue: number[][];
	private queueSlot: number = 0;
	private scheduledTiles: number = 0;
	private speedFactor: number;

	/**
	 * Create a new attack executor.
	 * @param player The player that is attacking.
	 * @param target The player that is being attacked, or null if the target is unclaimed territory.
	 * @param troops The amount of troops that are attacking.
	 * @param borderTiles The tiles from which the attack is executed, or null to use the player's border tiles.
	 */
	constructor(player: Player, target: Player | null, troops: number, borderTiles: Set<number> | null = null) {
		this.transaction = target ? new PlayerTerritoryTransaction(player, target) : new TerritoryTransaction(player);
		this.player = player;
		this.target = target;
		this.troops = troops;
		this.tileQueue = new Array(MAX_ATTACK_SCHEDULE).fill(null).map(() => []);
		this.orderTiles(borderTiles);
		this.speedFactor = this.calculateSpeedFactor();
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
		const defenseCost = Math.ceil((1 + attackCost) / 1.7);
		this.speedFactor = this.calculateSpeedFactor();

		const currentSlot = this.tileQueue[this.queueSlot % MAX_ATTACK_SCHEDULE];
		let conquered = 0;
		while (this.troops >= attackCost && currentSlot.length > 1) {
			this.queueSlot = currentSlot.pop() || 0;
			const tile = currentSlot.pop() || 0;
			this.scheduledTiles--;
			if (!territoryManager.isOwner(tile, this.target ? this.target.id : territoryManager.OWNER_NONE)) continue;
			if (!bordersTile(tile, this.player.id)) continue;
			territoryManager.conquer(tile, this.player.id, this.transaction);

			this.troops -= attackCost + gameMap.tileExpansionCosts[tile] / 50;
			conquered++;
		}

		this.transaction.apply();

		if (this.target) this.target.removeTroops(conquered * defenseCost);

		if (this.scheduledTiles <= 0 || this.troops < attackCost) return false;

		this.queueSlot = Math.floor(this.queueSlot + 1);
		return true;
	}

	/**
	 * Handle the addition of a tile to the player's territory.
	 * Called when a new tile is added to the player's territory (including by this attack).
	 * @param tile The tile that was added.
	 */
	handlePlayerTileAdd(tile: number) {
		onNeighbors(tile, neighbor => {
			if (territoryManager.isOwner(neighbor, this.target ? this.target.id : territoryManager.OWNER_NONE)) {
				const delay = this.queueSlot + gameMap.tileExpansionTimes[tile] * (0.025 + random.next() * 0.06) * this.speedFactor;
				this.tileQueue[Math.floor(delay) % MAX_ATTACK_SCHEDULE].push(neighbor);
				this.tileQueue[Math.floor(delay) % MAX_ATTACK_SCHEDULE].push(delay);
				this.scheduledTiles++;
			}
		});
	}

	/**
	 * Handle the addition of a tile to the target's territory.
	 * Called when a new tile is added to the target's territory.
	 * @param tile The tile that was added.
	 */
	handleTargetTileAdd(tile: number) {
		if (bordersTile(tile, this.player.id)) {
			const delay = this.queueSlot + gameMap.tileExpansionTimes[tile] * (0.025 + random.next() * 0.06) * this.speedFactor;
			this.tileQueue[Math.floor(delay) % MAX_ATTACK_SCHEDULE].push(tile);
			this.tileQueue[Math.floor(delay) % MAX_ATTACK_SCHEDULE].push(delay);
			this.scheduledTiles++;
		}
	}

	/**
	 * Build the initial tile queue.
	 * @param borderTiles The tiles to calculate initial tile queue from, or null to use the player's border tiles.
	 * @private
	 */
	private orderTiles(borderTiles: Set<number> | null = null): void {
		const tileOwners = territoryManager.tileOwners;
		const target = this.target ? this.target.id : territoryManager.OWNER_NONE;

		const result = [];
		const amountCache = attackActionHandler.amountCache;
		for (const tile of borderTiles || this.player.borderTiles) {
			const x = tile % gameMap.width;
			const y = Math.floor(tile / gameMap.width);
			if (x > 0 && tileOwners[tile - 1] === target) {
				if (!amountCache[tile - 1]) result.push(tile - 1);
				amountCache[tile - 1]++;
			}
			if (x < gameMap.width - 1 && tileOwners[tile + 1] === target) {
				if (!amountCache[tile + 1]) result.push(tile + 1);
				amountCache[tile + 1]++;
			}
			if (y > 0 && tileOwners[tile - gameMap.width] === target) {
				if (!amountCache[tile - gameMap.width]) result.push(tile - gameMap.width);
				amountCache[tile - gameMap.width]++;
			}
			if (y < gameMap.height - 1 && tileOwners[tile + gameMap.width] === target) {
				if (!amountCache[tile + gameMap.width]) result.push(tile + gameMap.width);
				amountCache[tile + gameMap.width]++;
			}
		}

		const speedFactor = this.calculateSpeedFactor();
		for (const tile of result) {
			const delay = gameMap.tileExpansionTimes[tile] * (0.08 - 0.02 * amountCache[tile] + random.next() * 0.06) * speedFactor;
			amountCache[tile] = 0;
			this.tileQueue[Math.floor(delay) % MAX_ATTACK_SCHEDULE].push(tile);
			this.tileQueue[Math.floor(delay) % MAX_ATTACK_SCHEDULE].push(delay);
			this.scheduledTiles++;
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
		return 2 / (0.325 + Math.log(1 + Math.min(50, this.player.getTerritorySize() * this.player.getTroops() / Math.max(1, this.target.getTerritorySize()) / Math.max(1, this.target.getTroops()))));
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
		return Math.floor(this.target.getTroops() / Math.max(1, this.target.getTerritorySize()) * 2);
	}
}