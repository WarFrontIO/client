import {gameTicker} from "../../game/GameTicker";
import {formatTime} from "../../util/StringFormatter";
import {registerSettingListener} from "../../util/UserSettingManager";
import {registerClickListener} from "../UIEventResolver";
import {showUIElement} from "../UIManager";

registerClickListener("openSettings", () => showUIElement("SettingsPanel"));
registerClickListener("exitGame", () => window.location.reload());

const gameClock: HTMLElement = (window.document.getElementById("gameClock") as HTMLElement);
gameTicker.registry.register(() => gameClock.innerHTML = formatTime(gameTicker.getElapsedTime()));
registerSettingListener("hud-clock", show => gameClock.style.display = show ? "inherit" : "none", true);