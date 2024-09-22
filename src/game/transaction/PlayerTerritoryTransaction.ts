import {Player} from "../player/Player";
import {getSetting} from "../../util/UserSettingManager";
import {territoryRenderingManager} from "../../renderer/manager/TerritoryRenderingManager";
import {TerritoryTransaction} from "./TerritoryTransaction";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";

export class PlayerTerritoryTransaction extends TerritoryTransaction {
	protected readonly defendant: Player;
	private readonly defendantBorderQueue: Array<number> = [];
	private defendantNamePos: number = 0;
	private defendantNamePosSize: number = -1;

	constructor(attacker: Player, defendant: Player) {
		super(attacker);
		this.defendant = defendant;
	}

	/**
	 * Get the player that is being attacked.
	 */
	getDefendant(): Player {
		return this.defendant;
	}

	setDefendantBorder(tile: number): void {
		this.defendantBorderQueue.push(tile);
	}

	setDefendantNamePos(pos: number, size: number): void {
		if (size > this.defendantNamePosSize) {
			this.defendantNamePos = pos;
			this.defendantNamePosSize = size;
		}
	}

	apply() {
		territoryRenderingManager.paintTiles(this.defendantBorderQueue, getSetting("theme").getBorderColor(this.defendant.baseColor));
		this.defendantBorderQueue.length = 0;

		if (this.defendantNamePosSize > -1) {
			playerNameRenderingManager.getPlayerData(this.defendant).handleRemove(playerNameRenderingManager.getNameDepth(), this.defendantNamePosSize, this.defendantNamePos);
			this.defendantNamePosSize = -1;
		}

		super.apply();
	}
}