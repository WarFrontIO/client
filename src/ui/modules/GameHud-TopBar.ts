import {startGame} from "../../game/Game";
import { gameTicker, GameTickListener } from "../../game/GameTicker";
import {mapFromId} from "../../map/MapRegistry";
import { formatTime } from "../../util/StringFormatter";
import { getSetting, registerSettingListener } from "../../util/UserSettingManager";
import {closeModule, ModuleAdapter} from "../ModuleLoader";
import {openModule} from "../ModuleLoader";

class ClockListener implements GameTickListener {
	tick() {
		lblGameTime.innerHTML = formatTime(gameTicker.getElapsedTime());
	}
}


const gameClock: HTMLElement = (window.document.getElementById("gameClock") as HTMLElement);

const lblGameTime: HTMLElement = (window.document.getElementById("lblGameTime") as HTMLElement);
const clockListener: ClockListener = new ClockListener();

export default {
	onOpen: () => {
		gameTicker.registry.register(clockListener);

		// Initialize elements according to user settings
		getSetting("gameHud-clock") ? gameClock.style.display = "inherit" : gameClock.style.display = "none";
	}
} as ModuleAdapter;

registerSettingListener("gameHud-clock", (show) => { show ? gameClock.style.display = "inherit" : gameClock.style.display = "none" });



(window as any).commandShowSettings = function () {
	openModule("SettingsPanel");
};

(window as any).commandExitGame = function () {
	window.location.reload();
};
