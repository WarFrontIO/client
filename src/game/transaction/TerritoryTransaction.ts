import {Transaction} from "./Transaction";
import {getSetting} from "../../util/UserSettingManager";
import {territoryRenderingManager} from "../../renderer/manager/TerritoryRenderingManager";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";

export class TerritoryTransaction extends Transaction {
	private readonly territoryQueue: Array<number> = [];
	private readonly borderQueue: Array<number> = [];
	private namePos: number = 0;
	private namePosSize: number = 0;

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

	/**
	 * Set the name position of the player.
	 * This will use the greatest size this transaction has seen.
	 * @param pos The position of the name
	 * @param size The size of the name
	 */
	setNamePos(pos: number, size: number) {
		if (size > this.namePosSize) {
			this.namePos = pos;
			this.namePosSize = size;
		}
	}

	/**
	 * Set the defendant name position.
	 * @param _pos The position of the name
	 * @param _size The size of the name
	 */
	setDefendantNamePos(_pos: number, _size: number) {
		// Noop
	}

	apply() {
		territoryRenderingManager.paintTiles(this.borderQueue, getSetting("theme").getBorderColor(this.player.baseColor));
		territoryRenderingManager.paintTiles(this.territoryQueue, getSetting("theme").getTerritoryColor(this.player.baseColor));
		this.territoryQueue.length = 0;
		this.borderQueue.length = 0;

		if (this.namePosSize > 0) {
			playerNameRenderingManager.getPlayerData(this.player).addPosition(this.namePosSize, this.namePos);
			this.namePosSize = 0;
		}

		super.apply();
	}
}