import type {Player} from "./player/Player";
import {gameTicker} from "./GameTicker";
import {gameInitRegistry} from "./Game";
import {playerManager} from "./player/PlayerManager";

export let largestPlayers: Player[] = [];

gameInitRegistry.register(() => {
	largestPlayers = [...playerManager.getPlayers()];
});

gameTicker.registry.register(() => {
	largestPlayers.sort((a, b) => b.getTerritorySize() - a.getTerritorySize());
});