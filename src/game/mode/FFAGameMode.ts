import {GameMode} from "./GameMode";
import {largestPlayers} from "../GameStats";
import {playerManager} from "../player/PlayerManager";
import {FFAGameResult} from "../result/FFAGameResult";

export class FFAGameMode extends GameMode {
	getResult() {
		// Win condition: 90% of total occupied territory.
		const totalTerritory = playerManager.getPlayers().reduce((acc, player) => acc + player.getTerritorySize(), 0);
		if (largestPlayers[0].getTerritorySize() > 0.9 * totalTerritory) {
			return new FFAGameResult(largestPlayers[0]);
		}
		return null;
	}
}