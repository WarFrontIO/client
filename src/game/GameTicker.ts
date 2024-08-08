import {EventHandlerRegistry} from "../event/EventHandlerRegistry";

class GameTicker {
	private readonly TICK_INTERVAL = 1000 / 20; // 50ms
	private ticker: NodeJS.Timeout;
	private tickCount: number;

	/**
	 * Registry for game tick listeners.
	 * Game tick listeners are called once per game tick allowing for game logic to be updated.
	 *
	 * Format: () => void
	 */
	registry: EventHandlerRegistry<[]> = new EventHandlerRegistry();

	/**
	 * Starts and resets the game ticker.
	 * Do not call this to implement a pause behavior.
	 * @internal
	 */
	start() {
		this.tickCount = 0;
		this.ticker = setInterval(() => this.tick(), this.TICK_INTERVAL);
	}

	/**
	 * Stops the game ticker.
	 * Do not call this to implement a pause behavior.
	 * @internal
	 */
	stop() {
		clearInterval(this.ticker);
	}

	private tick() {
		this.tickCount++;
		this.registry.broadcast();
	}

	/**
	 * Gets the current tick count.
	 *
	 * Do not use this to calculate time differences.
	 * There is no guarantee that the ticker runs at a constant rate.
	 * @returns The current tick count.
	 */
	getTickCount(): number {
		return this.tickCount;
	}

	/**
	 * Gets the elapsed in-game-time in milliseconds.
	 * Note that this is not necessarily the same as the real-world time.
	 * @returns The elapsed in-game-time in milliseconds.
	 */
	getElapsedTime(): number {
		return this.tickCount * this.TICK_INTERVAL;
	}
}

export const gameTicker = new GameTicker();