import {closeModule} from "../ModuleLoader";

(window as any).commandCloseImprintPanel = function () {
	closeModule("ImprintPanel");
};