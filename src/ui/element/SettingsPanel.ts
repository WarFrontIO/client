import {buildPanel, showPanel} from "../type/UIPanel";
import {buildContainer, ContentField} from "../type/ContentField";
import {Setting, SettingCategory} from "../../util/settings/Setting";
import {buildButton, buildIcon, buildSectionHeader} from "../type/TextNode";
import {settingAddRegistry} from "../../util/settings/SettingRegistry";
import {buildCheckboxInput} from "../type/CheckboxInput";
import {buildSingleSelect} from "../type/SingleSelectElement";
import {BooleanSetting} from "../../util/settings/BooleanSetting";
import {UIElement} from "../UIElement";
import {AssertionFailedException} from "../../util/Exceptions";
import {SingleSelectSetting} from "../../util/settings/SingleSelectSetting";
import {StringSetting} from "../../util/settings/StringSetting";
import {buildValidatedInput} from "../type/ValidatedInput";
import {MultiSelectSetting, Option} from "../../util/settings/MultiSelectSetting";
import {getUIElement} from "../UIManager";
import {tUnsafe} from "../../util/Lang";

//@module ui

const tabContainer = buildContainer("settings-tab-container");
const contentContainer = buildContainer("settings-category-container");
const categories = new Map<SettingCategory, ContentField>();
const categoryTabs = new Map<SettingCategory, ContentField>();

let currentCategory: SettingCategory | null = null;

buildPanel("SettingsPanel").setTitle("Settings").addBodyClass("flex-row").add(tabContainer).add(contentContainer);

let settingTypeId = 0;
const types = new Map<number, (setting: Setting<unknown>) => UIElement>();
const pendingTypes: Setting<unknown>[] = [];

/**
 * Register a rendering function for a setting type.
 * @param type The setting type
 * @param builder The rendering function
 */
export function registerSettingType<T>(type: T extends Setting<infer _> ? { prototype: T } : never, builder: (setting: T) => UIElement) {
	const id = settingTypeId++;
	(type.prototype as Annotated<T>)["settingMagicRendererId"] = id;
	types.set(id, builder as (setting: Setting<unknown>) => UIElement);

	for (const setting of pendingTypes) {
		if ((setting as unknown as Annotated<T>)["settingMagicRendererId"] === id) {
			const category = setting.getCategory();
			if (!category) throw new AssertionFailedException("Setting has no category");
			const content = categories.get(category);
			if (!content) throw new AssertionFailedException("Category not found");
			content.add(builder(setting as T));
			pendingTypes.splice(pendingTypes.indexOf(setting), 1);
		}
	}
}

/**
 * Get the tab for a setting category.
 * @param category The category
 */
export function getSettingTab(category: SettingCategory) {
	return categories.get(category);
}

settingAddRegistry.register(setting => {
	const category = setting.getCategory();
	if (!category) return; // Settings without a category are not displayed
	let content = categories.get(category);
	if (!content) {
		content = buildContainer("settings-category").add(buildSectionHeader(category.name));
		contentContainer.add(content);

		const tab = buildContainer("settings-tab").add(buildIcon(category.icon ?? "close").setAttribute("tabindex", "0")).onClick(() => {
			if (currentCategory) {
				categories.get(currentCategory)?.getElement().classList.remove("settings-category-active");
				categoryTabs.get(currentCategory)?.getElement().classList.remove("settings-tab-active");
			}
			content?.getElement().classList.add("settings-category-active");
			tab.getElement().classList.add("settings-tab-active");
			currentCategory = category
		});
		tabContainer.add(tab);

		categories.set(category, content);
		categoryTabs.set(category, tab);
		if (!currentCategory) {
			currentCategory = category;
			content.getElement().classList.add("settings-category-active");
			tab.getElement().classList.add("settings-tab-active");
		}
	}

	//TODO: Description texts
	const settingType = types.get((setting as Annotated<typeof setting>).settingMagicRendererId);
	if (settingType) {
		content.add(settingType(setting));
	} else {
		pendingTypes.push(setting);
	}
});

registerSettingType(BooleanSetting, setting => buildCheckboxInput(tUnsafe(`setting.boolean.${setting.getSaveId()}`)).linkSetting(setting));
registerSettingType(SingleSelectSetting, setting => buildSingleSelect(tUnsafe(`setting.select.${setting.getSaveId()}`)).linkSetting(setting));
registerSettingType(StringSetting, setting => buildValidatedInput(tUnsafe(`setting.string.${setting.getSaveId()}.placeholder`), tUnsafe(`setting.string.${setting.getSaveId()}`)).linkSetting(setting));
registerSettingType(MultiSelectSetting, (setting: MultiSelectSetting<unknown, Record<string, Option<unknown>>>) => buildContainer().add(buildButton(tUnsafe(`setting.select.${setting.getSaveId()}`)).onClick(() => showMultiSelectPanel(setting))));

/**
 * Shows a multi-select panel.
 * @param setting The setting to show the panel for
 */
export function showMultiSelectPanel(setting: MultiSelectSetting<unknown, Record<string, Option<unknown>>>) {
	const content = [];
	for (const [key, option] of Object.entries(setting.get())) {
		content.push(buildCheckboxInput(option.label).linkMultiSetting(setting, key));
	}
	showPanel(tUnsafe(`setting.select.${setting.getSaveId()}.title`), ...content);
}

const observer = new MutationObserver(() => {
	if (!currentCategory) return;
	const category = categories.get(currentCategory);
	if (!category || !category.getElement().checkVisibility()) return;

	const rowGap = parseFloat(getComputedStyle(category.getElement()).rowGap);
	const height = category.getChildren().reduce((sum, child) => sum + child.getClientHeight() + rowGap, 0);
	const halfHeight = category.getChildren().reduce((sum, child) => sum > height / 2 ? sum : sum + child.getClientHeight() + rowGap, 0);
	category.getElement().style.maxHeight = `${halfHeight + 5}px`;
});
observer.observe(getUIElement("SettingsPanel").getElement(), {childList: true, subtree: true, attributes: true, characterData: true});

type Annotated<T> = T & { settingMagicRendererId: number };