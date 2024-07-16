import {TileManager} from "./map/TileManager";
import {openModule} from "./ui/ModuleLoader";

export const tileManager = new TileManager();

window.addEventListener("load", () => {
	openModule("MainMenu");
});