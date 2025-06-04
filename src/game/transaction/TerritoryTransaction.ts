import {borderManager, type BorderTransitionResult} from "../BorderManager";
import type {Player} from "../player/Player";
import {Transaction} from "./Transaction";
import {getTransactionExecutors, registerTransactionType} from "./TransactionExecutors";
import {InvalidArgumentException} from "../../util/Exceptions";

export class TerritoryTransaction extends Transaction {
	protected readonly attacker: Player | null;
	protected readonly defendant: Player | null;
	protected readonly tiles: Set<number> = new Set();
	protected borderData: BorderTransitionResult;

	/**
	 * Create a new territory transaction.
	 * @param attacker The player that is attacking, or null if the territory is being cleared.
	 * @param defendant The player that is being attacked, or null if the territory is being claimed.
	 * @throws InvalidArgumentException if both attacker and defendant are null
	 */
	constructor(attacker: Player | null, defendant: Player | null) {
		if (!attacker && !defendant) {
			throw new InvalidArgumentException("Both attacker and defendant are null");
		}
		super(attacker ?? defendant as Player);
		this.attacker = attacker;
		this.defendant = defendant;
		this.addExecutor(...getTransactionExecutors(TerritoryTransaction));
	}

	/**
	 * Add a tile to the territory update queue.
	 * @param tile index of the tile
	 */
	addTile(tile: number): void {
		this.tiles.add(tile);
	}

	override apply() {
		if (this.tiles.size === 0) return;
		this.borderData = borderManager.transitionTiles(this.tiles, this.attacker?.id ?? -1, this.defendant?.id ?? -1);
		super.apply();
	}

	cleanup() {
		this.tiles.clear();
	}
}

registerTransactionType(TerritoryTransaction);