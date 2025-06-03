import {getDefaultMapIds, mapFromId} from "../../map/MapRegistry";
import {getSetting, getSettingObject} from "../../util/settings/UserSettingManager";
import {startGame} from "../../game/Game";
import {gameModeFromId} from "../../game/mode/GameModeRegistry";
import {GameModeIds} from "../../network/protocol/util/GameTypeIds";
import {registerClickListener} from "../UIEventResolver";
import {loadValidatedInput} from "../type/ValidatedInput";
import {showPanel} from "../type/UIPanel";
import {loadStaticElement} from "../UIManager";
import {t} from "../../util/Lang";
import {buildButton} from "../type/TextNode";
import {buildContainer} from "../type/ContentField";
import {openMultiplayerLobby} from "./MultiplayerLobby";

//@module ui

loadStaticElement("MainMenu")

const btnStartMultiplayer: HTMLButtonElement = (window.document.getElementById("btnStartMultiplayer") as HTMLButtonElement);
const btnStartSingleplayer: HTMLButtonElement = (window.document.getElementById("btnStartSingleplayer") as HTMLButtonElement);

const playerNameValidationExp: RegExp = /^[a-zA-Z0-9\u00A0-\u00FF\u0100-\u024F\u1E00-\u1EFF\-_. ({)}<>]*$/;

registerClickListener("btnStartMultiplayer", () => openMultiplayerLobby());

registerClickListener("btnStartSingleplayer", () => {
	showPanel(t("menu.map.select"), buildContainer("grid", "grid-3col").setContent(...getDefaultMapIds().map(map =>
		buildButton(map.name).onClick(() => startGame(mapFromId(map.id), gameModeFromId(GameModeIds.FFA), 23452345, [{name: getSetting("player-name")}], 0, true)))
	));
});

registerClickListener("linkImprint", () => showPanel("Site Notice"));
registerClickListener("linkPrivacy", () => showPanel("Privacy Policy"));

loadValidatedInput("playerNameInput", "playerNameInputValidation")
	.onInput((_value, valid) => {
		btnStartMultiplayer.disabled = !valid;
		btnStartSingleplayer.disabled = !valid;
	})
	.mutate(value => value.trim())
	.addRule("Name contains invalid characters.", value => playerNameValidationExp.test(value))
	.addRule("Name is too short (must be at least 3 characters).", value => value.length >= 3)
	.addRule("Name is too long (32 characters maximum).", value => value.length <= 32)
	.linkSetting(getSettingObject("player-name"), false);