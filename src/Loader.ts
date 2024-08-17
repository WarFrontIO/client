import {TileManager} from "./map/TileManager";

export const tileManager = new TileManager();
import {handlePath} from "./util/PathHandler";

window.addEventListener("load", () => {
	handlePath();
});