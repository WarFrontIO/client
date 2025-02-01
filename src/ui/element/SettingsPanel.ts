import {buildPanel} from "../type/UIPanel";
import {buildContainer, ContentField} from "../type/ContentField";
import {SettingCategory} from "../../util/settings/Setting";
import {buildIcon, buildSectionHeader} from "../type/TextNode";
import {settingAddRegistry} from "../../util/settings/SettingRegistry";
import {buildCheckboxInput} from "../type/CheckboxInput";
import {SettingKeyOf, SettingKeyTyped} from "../../util/settings/UserSettingManager";
import {buildSingleSelect} from "../type/SingleSelectElement";
import {SingleSelectSetting} from "../../util/settings/SingleSelectSetting";

const tabContainer = buildContainer("settings-tab-container");
const contentContainer = buildContainer("settings-category-container");
const categories = new Map<SettingCategory, ContentField>();

let currentCategory: SettingCategory | null = null;

buildPanel("SettingsPanel").setTitle("Settings").addBodyClass("flex-row").add(tabContainer).add(contentContainer);

settingAddRegistry.register((setting, key) => {
	const category = setting.getCategory();
	if (!category) return; // Settings without a category are not displayed
	let content = categories.get(category);
	if (!content) {
		content = buildContainer("settings-category", "grid", "grid-2col").add(buildSectionHeader(category.name));
		contentContainer.add(content);

		tabContainer.add(buildContainer("settings-tab").add(buildIcon(category.icon ?? "close")).onClick(() => {
			if (currentCategory) categories.get(currentCategory)?.getElement().classList.remove("settings-category-active");
			content?.getElement().classList.add("settings-category-active");
			currentCategory = category
		}));

		categories.set(category, content);
		if (!currentCategory) {
			currentCategory = category;
			content.getElement().classList.add("settings-category-active");
		}
	}

	//TODO: Description texts, allow registering custom setting types
	switch (setting.type) {
		case "boolean":
			content.add(buildCheckboxInput(key).linkSetting(key as SettingKeyOf<boolean>)); //TODO: This won't work for other setting registries
			break;
		case "single-select":
			content.add(buildSingleSelect(key).linkSetting(key as SettingKeyTyped<SingleSelectSetting<unknown>>));
			break;
		default:
			console.warn(`Setting type ${setting.type} cannot be displayed`);
	}
});