import {Player} from "../player/Player";
import {applyTransaction} from "./TransactionManager";

export abstract class Transaction {
	protected readonly player: Player;

	constructor(player: Player) {
		this.player = player;
	}

	/**
	 * Get the player that caused the transaction.
	 */
	getPlayer(): Player {
		return this.player;
	}

	/**
	 * Apply the transaction to the game.
	 */
	apply() {
		applyTransaction(this);
	}
}