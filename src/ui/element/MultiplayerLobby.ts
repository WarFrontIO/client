import {getSetting} from "../../util/settings/UserSettingManager";
import {connectToServer, disconnectFromServer, packetRegistry} from "../../network/NetworkManager";
import {GameQueueUpdatePacket} from "../../network/protocol/packet/game/GameQueueUpdatePacket";
import {hidePanel, showPanel, updatePanel} from "../type/UIPanel";
import {buildTextNode} from "../type/TextNode";

let abortController: AbortController | null = null;

export function openMultiplayerLobby() {
	showPanel("Connecting to Multiplayer Lobby", buildTextNode("Connecting to server..."))
		.setCloseHandler(() => {
			if (abortController) {
				abortController.abort();
				abortController = null;
			} else {
				disconnectFromServer();
			}
			hidePanel();
		});
	abortController = new AbortController();
	connectToServer(getSetting("game-server"), abortController.signal).then(() => {
		abortController = null;
	}).catch(() => {
		//TODO: Show error message
		hidePanel();
	});
}

packetRegistry.handle(GameQueueUpdatePacket, function () {
	updatePanel(buildTextNode(`Game starting in ${this.time} seconds (${this.playerCount} player${this.playerCount > 1 ? "s" : ""})...`));
});