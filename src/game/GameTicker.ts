import {EventHandlerRegistry} from "../event/EventHandlerRegistry";
import {GameTickPacket} from "../network/protocol/packet/game/GameTickPacket";
import {packetRegistry} from "../network/NetworkManager";
import {isLocalGame} from "./GameData";

class GameTicker {
	private readonly TICK_INTERVAL = 1000 / 20; // 50ms
	isRunning = false;
	private ticker: NodeJS.Timeout;
	private tickCount: number;
	private tickStart: number;
	readonly dataPacketQueue: GameTickPacket[] = [];

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
		if (this.isRunning) {
			throw new Error("Game ticker is already running");
		}
		this.isRunning = true;
		this.tickCount = 0;
		this.tickStart = Date.now();
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
		if (isLocalGame) {
			this.registry.broadcast();
			this.tickCount++;
			return;
		}

		if (this.dataPacketQueue.length > 1) { // This might happen if the page was in the background for a while
			const targetTick = (Math.ceil(this.tickCount / 10) + this.dataPacketQueue.length - 1) * 10;
			console.warn(`Game tick is behind by ${targetTick - this.tickCount} ticks`);
			for (let i = this.tickCount; i < targetTick; i++) this.actuallyDoTick();
		} else if ((this.tickCount + 1) * this.TICK_INTERVAL < Date.now() - this.tickStart) {
			this.actuallyDoTick();
		}

		this.actuallyDoTick();
	}

	private actuallyDoTick() {
		if (this.tickCount % 10 === 0) {
			const packet = this.dataPacketQueue.shift();
			if (!packet) {
				this.tickStart = Date.now() - this.tickCount * this.TICK_INTERVAL; // Looks like we're a bit ahead
				return;
			}
			for (const action of packet.packets) {
				packetRegistry.getPacketHandler(action.id).call(action);
			}
		}
		this.registry.broadcast();
		this.tickCount++;
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

	/**
	 * Adds a game tick packet to the queue.
	 * @param gameTickPacket The game tick packet to add.
	 */
	addPacket(gameTickPacket: GameTickPacket) {
		this.tickStart = Date.now() - (Math.ceil(this.tickCount / 10) + gameTicker.dataPacketQueue.length) * 10 * this.TICK_INTERVAL;
		this.dataPacketQueue.push(gameTickPacket);
	}
}

export const gameTicker = new GameTicker();