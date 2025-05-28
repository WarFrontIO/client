import {Player} from "./player/Player";
import {gameTicker} from "./GameTicker";
import {gameStartRegistry} from "./Game";
import {playerManager} from "./player/PlayerManager";

export let largestPlayers: Player[] = [];

gameStartRegistry.register(() => {
	largestPlayers = [...playerManager.getPlayers()];
});

gameTicker.registry.register(() => {
	largestPlayers.sort((a, b) => b.getTerritorySize() - a.getTerritorySize());
});