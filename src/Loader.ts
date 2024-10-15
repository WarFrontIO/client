import {handlePath} from "./util/PathHandler";

window.addEventListener("load", () => {
	handlePath();
});

import("./renderer/GameRenderer");