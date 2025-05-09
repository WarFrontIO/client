import {getSetting} from "../../util/settings/UserSettingManager";
import {connectToServer, disconnectFromServer, packetRegistry} from "../../network/NetworkManager";
import {GameQueueUpdatePacket} from "../../network/protocol/packet/game/GameQueueUpdatePacket";
import {hidePanel, showPanel, updatePanel} from "../type/UIPanel";
import {buildTextNode} from "../type/TextNode";

//@module ui

let abortController: AbortController | null = null;

export function openMultiplayerLobby() {
	abortController = new AbortController();
	let error = false;
	connectToServer(getSetting("game-server"), abortController.signal).then(() => {
		abortController = null;
	}).catch(() => {
		hidePanel();
		error = true;
	});

	setTimeout(() => {
		if (error) return;
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
	}, 500);
}

packetRegistry.handle(GameQueueUpdatePacket, function () {
	updatePanel(buildTextNode(`Game starting in ${this.time} seconds (${this.playerCount} player${this.playerCount > 1 ? "s" : ""})...`));
});