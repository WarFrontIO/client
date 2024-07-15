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
	registry: EventHandlerRegistry<[]> = new EventHandlerRegistry(false, listener => listener());

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
}

export const gameTicker = new GameTicker();