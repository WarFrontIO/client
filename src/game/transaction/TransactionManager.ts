import {EventHandlerRegistry} from "../../event/EventHandlerRegistry";
import {Transaction} from "./Transaction";

const registry = new EventHandlerRegistry<[Transaction]>();

/**
 * Register a listener for transaction events.
 * @param listener The listener to register
 */
export function registerTransactionListener(listener: (transaction: Transaction) => void) {
	registry.register(listener);
}

/**
 * Apply a transaction to the game.
 * @param transaction The transaction to apply
 */
export function applyTransaction(transaction: Transaction) {
	registry.broadcast(transaction);
}