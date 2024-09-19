import {AttackTransaction} from "./AttackTransaction";
import {Player} from "../player/Player";
import {getSetting} from "../../util/UserSettingManager";
import {territoryRenderingManager} from "../../renderer/manager/TerritoryRenderingManager";

export class PlayerAttackTransaction extends AttackTransaction {
	protected readonly defendant: Player;
	private readonly defendantBorderQueue: Array<number> = [];

	constructor(attacker: Player, defendant: Player, troops: number) {
		super(attacker, troops);
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

	apply() {
		territoryRenderingManager.paintTiles(this.defendantBorderQueue, getSetting("theme").getBorderColor(this.defendant.baseColor));
		this.defendantBorderQueue.length = 0;
		super.apply();
	}
}