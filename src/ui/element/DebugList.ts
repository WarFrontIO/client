import {getSettingTab} from "./SettingsPanel";
import {categoryAdvanced} from "../../util/settings/UserSettingManager";
import {buildButton, buildSectionHeader, buildTextNode} from "../type/TextNode";
import {showPanel} from "../type/UIPanel";
import {getDebugEvents} from "../../util/DebugData";
import {buildContainer, buildContentField} from "../type/ContentField";
import {buildCopyableTextContainer} from "../type/CopyableTextContainer";
import {Anchor} from "../UIElement";

const tab = getSettingTab(categoryAdvanced);
if (!tab) throw new Error("Settings tab not found");
tab.add(buildContainer().add(buildButton("Debug Events").onClick(() => {
	const content = [];
	for (const event of getDebugEvents()) {
		content.push(buildContentField("secondary", buildSectionHeader(event.name, "mb-1_2"), ...event.data.map(data => buildCopyableTextContainer(data.name, JSON.stringify(data.value), ["data-copy-title"], ["data-copy-content"])))
			.anchor(buildTextNode(new Date(event.time).toLocaleTimeString(), "m-1_2"), Anchor.TOP_RIGHT));
	}
	if (content.length === 0) {
		content.push(buildSectionHeader("No debug events have been triggered"));
	}
	showPanel("Debug Events", ...content);
})));