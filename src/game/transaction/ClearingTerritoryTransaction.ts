import {TerritoryTransaction} from "./TerritoryTransaction";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";

export class ClearingTerritoryTransaction extends TerritoryTransaction {
	apply() {
		super.apply();
		//TODO: Hack to reindex name position, should be done in a better way (this should not be this class's responsibility)
		playerNameRenderingManager.getPlayerData(this.player).validatePosition();
	}
}