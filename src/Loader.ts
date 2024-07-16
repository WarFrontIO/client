import {TileManager} from "./map/TileManager";
import {openMenu} from "./ui/ModuleLoader";
import {initHudElements} from "./hud/HudManager";

export const tileManager = new TileManager();

window.addEventListener("load", () => {
	openMenu("MainMenu");
	initHudElements();
});