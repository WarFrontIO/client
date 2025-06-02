import {gameTicker} from "../../game/GameTicker";
import {formatTime, formatTroops} from "../../util/StringFormatter";
import {registerSettingListener} from "../../util/settings/UserSettingManager";
import {blockInteraction, registerClickListener, registerDragListener} from "../UIEventResolver";
import {hideAllUIElements, loadStaticElement, showUIElement} from "../UIManager";
import {interactionManager} from "../../event/InteractionManager";
import {resolveElement} from "../UIElement";
import {mapActionHandler} from "../../game/action/MapActionHandler";
import {gameStartRegistry} from "../../game/Game";
import {clientPlayer} from "../../game/player/PlayerManager";

//@module ui

loadStaticElement("GameHud");

registerClickListener("openSettings", () => showUIElement("SettingsPanel"));
registerClickListener("exitGame", () => window.location.reload());

const gameClock: HTMLElement = (window.document.getElementById("gameClock") as HTMLElement);
gameTicker.registry.register(() => gameClock.innerHTML = formatTime(gameTicker.getElapsedTime()));
registerSettingListener("hud-clock", show => gameClock.style.display = show ? "inherit" : "none");

interactionManager.draggable.add(resolveElement("GameHudContainer"));

const slider: HTMLElement = resolveElement("sliderAttackStrength");
interactionManager.draggable.add(slider);
const updateValue = (x: number) => setSliderValue((x - slider.getBoundingClientRect().left) / slider.getBoundingClientRect().width);

registerClickListener(slider, updateValue, true, true);
registerDragListener(slider, updateValue, updateValue, () => {});

const hiddenSlider: HTMLInputElement = resolveElement("sliderAttackHidden") as HTMLInputElement;
hiddenSlider.onchange = () => setSliderValue(parseInt(hiddenSlider.value) / 100);

const numberDisplay: HTMLElement = resolveElement("sliderAttackNumber");
let label = false;
function setSliderValue(value: number) {
	if (value < 0) value = 0;
	if (value > 1) value = 1;
	slider.style.setProperty("--value", value.toString());
	if (value > 0.2 && label) {
		numberDisplay.classList.add("selector-number-reversed");
		label = false;
	} else if (value < 0.2 && !label) {
		numberDisplay.classList.remove("selector-number-reversed");
		label = true;
	}
	hiddenSlider.value = (value * 100).toString();

	const scaled = Math.expm1(2 * Math.LN2 * value) / 3;
	numberDisplay.innerHTML = (scaled * 100).toFixed(1) + "%";
	mapActionHandler.setPower(scaled * 1000);
}

const troopCountElement = resolveElement("selectorTroopCount");
const densityElement = resolveElement("selectorDensityNumber");
gameTicker.registry.register(() => {
	troopCountElement.innerText = formatTroops(clientPlayer.getTroops());
	densityElement.innerText = (clientPlayer.getTroops() / clientPlayer.getTerritorySize()).toFixed(2) + "%";
});

gameStartRegistry.register(() => {
	hideAllUIElements();
	showUIElement("GameHud");
	setSliderValue(0.5);
	troopCountElement.innerText = formatTroops(clientPlayer.getTroops());
	densityElement.innerText = (clientPlayer.getTroops() / clientPlayer.getTerritorySize()).toFixed(2) + "%";
});

blockInteraction(gameClock);
blockInteraction(resolveElement("selectorContainer"));