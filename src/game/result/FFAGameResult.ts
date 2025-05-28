import {GameResult} from "./GameResult";
import {Player} from "../player/Player";
import {t} from "../../util/Lang";

export class FFAGameResult extends GameResult {
	constructor(winner: Player) {
		super([winner]);
	}

	getWinnerString(): string {
		return t("game.winner.single", {name: this.winners[0].name})
	}
}