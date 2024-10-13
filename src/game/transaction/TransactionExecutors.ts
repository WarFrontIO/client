import {Transaction} from "./Transaction";
import {InvalidArgumentException} from "../../util/Exceptions";

const pool: Record<string, ((this: Transaction) => void)[]> = {};

/**
 * Register a transaction executor.
 * @param type The type of transaction
 * @param executor The executor to register
 * @throws InvalidArgumentException if the type is unknown
 */
export function registerTransactionExecutor<T extends Transaction>(type: { prototype: T, name: string }, executor: (this: T) => void) {
	if (!pool[type.name]) {
		throw new InvalidArgumentException(`Unknown transaction type: ${type.name}`);
	}
	pool[type.name].push(executor as (this: Transaction) => void);
}

/**
 * Register a transaction type to the pool.
 * @param type The type of transaction
 * @throws InvalidArgumentException if the type is already registered
 */
export function registerTransactionType<T extends Transaction>(type: { prototype: T, name: string }) {
	if (pool[type.name]) {
		throw new InvalidArgumentException(`Transaction type already registered: ${type.name}`);
	}
	pool[type.name] = [];
}

/**
 * Get the transaction executors for the given type.
 * @param type The type of transaction
 * @returns The transaction executors
 */
export function getTransactionExecutors<T extends Transaction>(type: { prototype: T, name: string }): ((this: T) => void)[] {
	return pool[type.name];
}