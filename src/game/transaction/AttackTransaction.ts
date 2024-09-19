import {Player} from "../player/Player";
import {TerritoryTransaction} from "./TerritoryTransaction";

export class AttackTransaction extends TerritoryTransaction {
	protected readonly troops: number;

	constructor(attacker: Player, troops: number) {
		super(attacker);
		this.troops = troops;
	}

	/**
	 * Get the player that started the attack.
	 */
	getAttacker(): Player {
		return this.player;
	}

	/**
	 * Get the amount of troops the attack started with.
	 */
	getTotalTroopCount(): number {
		return this.troops;
	}
}