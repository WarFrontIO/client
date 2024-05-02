import {Player} from "./Player";
import {BotPlayer} from "./BotPlayer";
import {spawnManager} from "./SpawnManager";
import {gameTicker, GameTickListener} from "../GameTicker";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";

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
		this.players = [];
		this.bots = [];

		clientPlayer = humans[clientId];
		for (const player of humans) {
			this.registerPlayer(player, false);
		}

		for (let i = humans.length; i < maxPlayers; i++) {
			this.registerPlayer(new BotPlayer(this.players.length), true);
		}
	}

	/**
	 * Register a player.
	 * @param player The player to register.
	 * @param isBot Whether the player is a bot.
	 */
	registerPlayer(player: Player, isBot: boolean): void {
		playerNameRenderingManager.registerPlayer(player);
		this.players.push(player);
		if (isBot) {
			this.bots.push(player as BotPlayer);
			spawnManager.randomSpawnPoint(player);
		}
	}

	/**
	 * Get the player with the given ID.
	 * @param id The ID of the player.
	 */
	getPlayer(id: number): Player {
		return this.players[id];
	}

	//TODO: bot ticking should be done in a separate bot manager
	tick(): void {
		this.bots.forEach(bot => bot.tick());
		if (gameTicker.getTickCount() % 10 === 0) {
			this.players.forEach(player => player.income());
		}
	}
}

export const playerManager = new PlayerManager();
export let clientPlayer: Player;