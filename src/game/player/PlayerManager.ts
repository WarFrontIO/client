import {Player} from "./Player";
import {BotPlayer} from "./BotPlayer";
import {spawnManager} from "./SpawnManager";
import {gameTicker, GameTickListener} from "../GameTicker";

class PlayerManager implements GameTickListener {
	private players: Player[];
	private bots: BotPlayer[];

	constructor() {
		gameTicker.registry.register(this);
	}

	/**
	 * Initializes the player manager with the given players.
	 * @param humans human players, one for local games, multiple for online games.
	 * @param clientId Player ID of the client player (the player that is controlled this client).
	 * @param maxPlayers The maximum number of players.
	 */
	init(humans: Player[], clientId: number, maxPlayers: number): void {
		this.players = humans;
		clientPlayer = this.players[clientId];
		this.bots = [];
		while (this.players.length < maxPlayers) {
			const bot = new BotPlayer(this.players.length);
			this.players.push(bot);
			this.bots.push(bot);
			spawnManager.randomSpawnPoint(bot);
		}
	}

	/**
	 * Get the player with the given ID.
	 * @param id The ID of the player.
	 */
	getPlayer(id: number): Player {
		return this.players[id];
	}

	tick(): void {
		this.bots.forEach(bot => bot.tick());
		if (gameTicker.getTickCount() % 10 === 0) {
			this.players.forEach(player => player.income());
		}
	}
}

export const playerManager = new PlayerManager();
export let clientPlayer: Player;