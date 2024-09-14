import {gameTicker} from "../../GameTicker";
import {random} from "../../Random";

export interface BotConstraints {
	/**
	 * @returns Whether to allow the bot to attack
	 */
	allowAttack(): boolean;
}

/**
 * This should always be the last bot constraint in the list.
 */
export class CooldownBotConstraints implements BotConstraints {
	private readonly cooldown: number;
	private lastAttack: number;

	/**
	 * Creates a new cooldown bot constraints.
	 * @param cooldown The cooldown in ticks
	 */
	constructor(cooldown: number) {
		this.cooldown = cooldown;
		this.lastAttack = -cooldown;
	}

	allowAttack(): boolean {
		if (gameTicker.getTickCount() - this.lastAttack < this.cooldown) {
			return false;
		}
		this.lastAttack = gameTicker.getTickCount();
		return true;
	}
}

//TODO: More constraints (e.g. based on expected density)

/**
 * Selects some random bot constraints.
 */
export function selectBotConstraints(): BotConstraints[] {
	return [new CooldownBotConstraints(random.nextInt(20))];
}