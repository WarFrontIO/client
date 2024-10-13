import {Transaction} from "./Transaction";
import {Player} from "../player/Player";
import {getTransactionExecutors, registerTransactionType} from "./TransactionExecutors";
import {InvalidArgumentException} from "../../util/Exceptions";

//TODO: Do border calculations when transaction is applied (we currently paint some border tiles multiple times)
export class TerritoryTransaction extends Transaction {
	protected readonly attacker: Player | null;
	protected readonly defendant: Player | null;
	protected readonly territoryQueue: Array<number> = [];
	protected readonly borderQueue: Array<number> = [];
	protected readonly defendantBorderQueue: Array<number> = [];
	protected namePos: number = 0;
	protected namePosSize: number = 0;
	protected defendantNamePos: number = 0;
	protected defendantNamePosSize: number = -1;

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
	setTerritory(tile: number): void {
		this.territoryQueue.push(tile);
	}

	/**
	 * Add a border to the territory update queue.
	 * @param tile index of the tile
	 */
	setBorder(tile: number): void {
		this.borderQueue.push(tile);
	}

	/**
	 * Set the border of the defendant player.
	 * @param tile index of the tile
	 */
	setDefendantBorder(tile: number): void {
		this.defendantBorderQueue.push(tile);
	}

	/**
	 * Set the name position of the player.
	 * This will use the greatest size this transaction has seen.
	 * @param pos The position of the name
	 * @param size The size of the name
	 */
	setNamePos(pos: number, size: number) {
		if (size > this.namePosSize) {
			this.namePos = pos;
			this.namePosSize = size;
		}
	}

	/**
	 * Set the defendant name position.
	 * @param pos The position of the name
	 * @param size The size of the name
	 */
	setDefendantNamePos(pos: number, size: number) {
		if (size > this.defendantNamePosSize) {
			this.defendantNamePos = pos;
			this.defendantNamePosSize = size;
		}
	}

	cleanup() {
		this.namePos = 0;
		this.namePosSize = 0;
		this.defendantNamePos = 0;
		this.defendantNamePosSize = -1;
		this.territoryQueue.length = 0;
		this.borderQueue.length = 0;
		this.defendantBorderQueue.length = 0;
	}
}

registerTransactionType(TerritoryTransaction);