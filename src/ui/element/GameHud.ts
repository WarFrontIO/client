import {gameTicker} from "../../game/GameTicker";
import {formatTime} from "../../util/StringFormatter";
import {registerSettingListener} from "../../util/settings/UserSettingManager";
import {registerClickListener} from "../UIEventResolver";
import {loadStaticElement, showUIElement} from "../UIManager";
import {interactionManager} from "../../event/InteractionManager";
import {resolveElement} from "../UIElement";

//@module ui

loadStaticElement("GameHud");

registerClickListener("openSettings", () => showUIElement("SettingsPanel"));
registerClickListener("exitGame", () => window.location.reload());

const gameClock: HTMLElement = (window.document.getElementById("gameClock") as HTMLElement);
gameTicker.registry.register(() => gameClock.innerHTML = formatTime(gameTicker.getElapsedTime()));
registerSettingListener("hud-clock", show => gameClock.style.display = show ? "inherit" : "none");

interactionManager.draggable.add(resolveElement("GameHudContainer"));