import {closeModule} from "../ModuleLoader";

(window as any).commandClosePrivacyPanel = function () {
	closeModule("PrivacyPanel");
};