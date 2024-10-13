import {Player} from "../player/Player";
import {getTransactionExecutors, registerTransactionType} from "./TransactionExecutors";

export abstract class Transaction {
	protected readonly player: Player;
	private readonly executors: ((this: this) => void)[] = [];

	protected constructor(player: Player) {
		this.player = player;
		this.addExecutor(...getTransactionExecutors(Transaction));
	}

	/**
	 * Add an executor to the transaction.
	 * @param executors The executors to add
	 */
	addExecutor(...executors: ((this: this) => void)[]) {
		this.executors.push(...executors);
	}

	/**
	 * Apply the transaction to the game.
	 */
	apply() {
		this.executors.forEach(executor => executor.call(this));
		this.cleanup();
	}

	/**
	 * Clean up the transaction.
	 * This should clear all data that was used while applying the transaction.
	 */
	abstract cleanup(): void;
}

registerTransactionType(Transaction);