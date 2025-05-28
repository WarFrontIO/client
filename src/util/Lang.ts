import {EventHandlerRegistry} from "../event/EventHandlerRegistry";

/**
 * Translate the given key.
 * @param key The key to translate
 * @param args The arguments to replace
 */
export const t = languageProxy<typeof eng>();

/**
 * Translate the given key.
 * This method is NOT typesafe, only use this when the key is not known (/dynamic)
 * @param key The key to translate
 * @param args The arguments to replace
 */
export const tUnsafe = languageProxy<Record<string, string>>() as (key: string, args?: Record<string, unknown>) => string;

/**
 * Create a translation function for the given language data type.
 * Set the generic parameter to your default language file, this will allow type-safe argument support.
 */
export function languageProxy<B extends Record<string, string>>() {
	return function <T extends LanguageKey<B>>(key: T, ...args: ({} extends Args<T, B> ? [] : never) | [Args<T, B>]): Example<T, B> {
		let data = args[0] === undefined ? langData[key] : findContext<B>(key, args[0]);
		if (!data) return `Missing language string: ${key}` as Example<T, B>;
		const inline = data.matchAll(/{{([^},]+)(?:,([^}]+))?}}/g);
		for (const match of inline) {
			const arg = match[1] ? match[1].trim() : "";
			if (arg === "") continue;
			if (match[2] && match[2].trim() === "number") {
				data = data.replace(match[0], numberFormat.format(arg as unknown as number));
			} else {
				data = data.replace(match[0], arg);
			}
		}
		return data as Example<T, B>; //Show the English preview in the editor
	};
}

/**
 * Finds a translation, applying context narrowing if possible.
 * If the arguments contain a "context" property, a fitting suffix is appended.
 * @param key The key to translate
 * @param args The arguments to replace
 */
function findContext<R>(key: LanguageKey<R>, args: Record<string, unknown>): string | undefined {
	if ("context" in args) {
		const data = findPlural(`${key}_${args["context"] as string}` as LanguageKey<R>, args);
		if (data) return data;
	}
	return findPlural(key, args);
}

/**
 * Finds a translation, applying plural narrowing if possible.
 * If the arguments contain a "count" property, a fitting suffix (depending on the selected language) is appended.
 * @param key The key to translate
 * @param args The arguments to replace
 */
function findPlural<R>(key: LanguageKey<R>, args: Record<string, unknown>): string | undefined {
	if ("count" in args) {
		if (args["count"] === 0) { //prioritize zero if present
			const ordinal = langData[`${key}_ordinal_zero`];
			if (ordinal) return ordinal;
			const data = langData[`${key}_zero`];
			if (data) return data;
		}
		const ordinal = pluralRulesOrdinal.select(args["count"] as number);
		const ordinalData = langData[`${key}_ordinal_${ordinal}`];
		if (ordinalData) return ordinalData;
		const rule = pluralRules.select(args["count"] as number);
		const data = langData[`${key}_${rule}`];
		if (data) return data;
	}
	return langData[key];
}

//TODO: Nesting, to allow for multiple plural forms

/**
 * Set the used language.
 * @param code Three letter identifier of the language (ISO 639-3)
 * @param data Language data
 */
export function setLanguage(code: string, data: Record<string, string>) {
	patchLanguage(data);
	langCode = code;
	numberFormat = new Intl.NumberFormat(langCode);
	pluralRules = new Intl.PluralRules(langCode);
	pluralRulesOrdinal = new Intl.PluralRules(langCode, {type: "ordinal"});
	languageChangeRegistry.broadcast();
}

/**
 * Add additional strings to the selected Language.
 * NOTE: You have to inject them every time the language is changed, see {@link languageChangeRegistry}
 * @param data The additional strings
 */
export function patchLanguage(data: Record<string, string>) {
	langData = {...langData, ...data};
}

export const languageChangeRegistry = new EventHandlerRegistry();

//TODO: a translation system should probably support multiple languages (load and cache language files)

/**
 * Master language data, used to allow typesafe argument injection.
 * Syntax is compatible with i18next, only supporting parts of the feature set:
 * - Arguments: {{ name }} or {{ name, format }}
 * - Available formats: number
 * - Plurals: Suffix _zero _one _two _few _many _other _singular (dependent on used language), each is available as ordinal
 * - Context: Context data suffix
 */
const eng = {
	"setting.select.wf@theme": "Theme",
	"setting.select.wf@debug-renderer": "Toggle Debug Renderers",
	"setting.select.wf@debug-renderer.title": "Debug Renderers",
	"setting.boolean.wf@hud-clock": "Display a clock in game hud",
	"setting.string.wf@game-server": "Server Address",
	"setting.string.wf@game-server.placeholder": "https://warfront.io",
} as const;

let langData: Record<string, string>;
let langCode: string;
let numberFormat: Intl.NumberFormat;
let pluralRules: Intl.PluralRules;
let pluralRulesOrdinal: Intl.PluralRules;

setLanguage("eng", eng);

type LanguageKey<B> = (keyof B | { [K in keyof B]: K extends `${infer A}_${string}` ? A : never }[keyof B]) & string;
type Args<T extends LanguageKey<B>, B> = { [K in ExtractArgsRecursive<T, B> as ExtractName<K>]: ExtractType<K> } & ImplicitArgs<T, B>;
type ImplicitArgs<T extends LanguageKey<B>, B> = T extends keyof B ? {} | { [K in keyof B]: K extends `${T}_${infer A}` ? ExtractImplicit<A> : never }[keyof B] : { [K in keyof B]: K extends `${T}_${infer A}` ? ExtractImplicit<A> : never }[keyof B];
type ExtractArgsRecursive<T extends LanguageKey<B>, B> = (T extends keyof B ? ExtractArgs<B[T]> : never) | { [K in keyof B]: K extends `${T}_${string}` ? ExtractArgs<B[K]> : never }[keyof B];
type ExtractArgs<T> = T extends `{{${infer A}}}${infer B}` ? A | ExtractArgs<B> : T extends `${string}${infer A}` ? ExtractArgs<A> : never;
type ExtractImplicit<T extends string> = T extends `${string}_${string}` ? {count: number, context: string} : T extends "zero" | "one" | "two" | "few" | "many" | "other" | "singular" ? {count: number} | {context: string} : {context: string};
type Trim<T> = T extends ` ${infer A}` ? Trim<A> : T extends `${infer A} ` ? Trim<A> : T;
type ExtractName<T extends string> = T extends `${infer A},${string}` ? Trim<A> : Trim<T>;
type ExtractType<T extends string> = T extends `${string},${infer A}` ? MatchType<Trim<A>> : string;
type MatchType<T extends string> = T extends "number" ? number : T;
type Example<T extends LanguageKey<B>, B> = T extends keyof B ? B[T] : { [K in keyof B]: K extends `${T}_${string}` ? B[K] : never }[keyof B];