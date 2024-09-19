import {Transaction} from "./Transaction";
import {getSetting} from "../../util/UserSettingManager";
import {territoryRenderingManager} from "../../renderer/manager/TerritoryRenderingManager";

export class TerritoryTransaction extends Transaction {
	private readonly territoryQueue: Array<number> = [];
	private readonly borderQueue: Array<number> = [];

	/**
	 * Add a tile to the territory update queue.
	 * @param tile index of the tile
	 */
	setTerritory(tile: number): void {
		this.territoryQueue.push(tile);
	}

	/**
	 * Add a border to the territory update queue.
	 * @param tile index of the tile
	 */
	setBorder(tile: number): void {
		this.borderQueue.push(tile);
	}

	/**
	 * Set the border of the defendant player.
	 * @param _tile index of the tile
	 */
	setDefendantBorder(_tile: number): void {
		// Noop
	}

	apply() {
		territoryRenderingManager.paintTiles(this.borderQueue, getSetting("theme").getBorderColor(this.player.baseColor));
		territoryRenderingManager.paintTiles(this.territoryQueue, getSetting("theme").getTerritoryColor(this.player.baseColor));
		this.territoryQueue.length = 0;
		this.borderQueue.length = 0;
		super.apply();
	}
}