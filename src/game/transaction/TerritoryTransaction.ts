import {Transaction} from "./Transaction";
import {Player} from "../player/Player";
import {getTransactionExecutors, registerTransactionType} from "./TransactionExecutors";

export class TerritoryTransaction extends Transaction {
	protected readonly defendant: Player | null;
	protected readonly territoryQueue: Array<number> = [];
	protected readonly borderQueue: Array<number> = [];
	protected readonly defendantBorderQueue: Array<number> = [];
	protected namePos: number;
	protected namePosSize: number;
	protected defendantNamePos: number;
	protected defendantNamePosSize: number;

	constructor(attacker: Player, defendant: Player | null) {
		super(attacker);
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