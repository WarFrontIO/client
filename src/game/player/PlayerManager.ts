import {Player} from "./Player";
import {BotPlayer} from "./BotPlayer";
import {spawnManager} from "./SpawnManager";
import {gameTicker, GameTickListener} from "../GameTicker";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";
import {Team} from "../Team";

class PlayerManager implements GameTickListener {
	private players: Player[];
	private bots: BotPlayer[];
    private teams: Team[];

    constructor() {
        gameTicker.registry.register(this);
    }

    /**
     * Initializes the player manager with the given players.
     * @param humans human players, one for local games, multiple for online games.
     * @param clientId Player ID of the client player (the player that is controlled this client).
     * @param maxPlayers The maximum number of players.
     * @param teams The number of teams (0 for none).
     */
    init(humans: Player[], clientId: number, maxPlayers: number, teams: number = 0): void {
        this.players = [];
        this.bots = [];

        if (teams) {
            this.generateTeams(teams);
        }

        clientPlayer = humans[clientId];
        for (const player of humans) {
            if (teams) {
                let teamedPlayer = new Player(this.players.length, player.name, this.teams[0]);
                this.registerPlayer(teamedPlayer, false);
            } else {
                this.registerPlayer(player, false);
            }
            
        }

        for (let i = humans.length; i < maxPlayers; i++) {
            let botPlayer: BotPlayer;
            if (teams) {
                botPlayer = new BotPlayer(this.players.length, this.teams[i % this.teams.length]);
            } else {
                botPlayer = new BotPlayer(this.players.length);
            }
            this.registerPlayer(botPlayer, true);
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

    /**
     * Generate the teams for the game.
     * @param numTeams The number of teams.
     */
    generateTeams(numTeams: number): void {
        this.teams = [];
        for (let i = 0; i < numTeams; i++) {
            this.teams.push(new Team([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]));
        }
    }
}

export const playerManager = new PlayerManager();
export let clientPlayer: Player;