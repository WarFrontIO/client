const {readdirSync, readFileSync} = require("fs");

module.exports = async function (theme) {
	if (theme.includes("// BUILD_THEMES_REGISTER")) {
		console.log("Registering themes...");

		let themes = [];
		for (const file of readdirSync("resources/themes")) {
			if (!file.endsWith(".json")) continue;

			const name = file.replace(".json", "");
			const data = JSON.parse(readFileSync("resources/themes/" + file, "utf8"));

			for (const key in defaultTheme) {
				if (!(key in data)) data[key] = defaultTheme[key];
			}

			const obj = {};
			for (const key of ["territory", "border", "tiles"]) {
				obj[key] = parseColorAction(data[key]);
			}

			const overwrites = {};
			for (const key in data.tileOverwrite) {
				overwrites[key] = parseColor(data.tileOverwrite[key]);
			}

			const stringified = `{
				getTerritoryColor(color: Color): Color {
					return ${obj.territory};
				},
				getBorderColor(color: Color): Color {
					return ${obj.border};
				},
				getTileColor(tile: TileType): Color {
					const color = tile.baseColor;
					return ${obj.tiles};
				},
				getBackgroundColor(): Color {
					return ${parseColor(data.background)};
				},
				getFont(): string {
					return "${data.font}";
				}
			}`;

			themes.push({
				name: name,
				obj: stringified,
				overwrites: Object.keys(overwrites).map(key => `"${key}": ${overwrites[key]}`)
			});
		}

		theme = theme.replace(/\/\/ BUILD_THEMES_REGISTER/, themes.map(m => `registerTheme("${m.name}", ${m.obj}, {${m.overwrites.join(", ")}});`).join("\n"));
	}
	return theme;
}

function parseColor(color) {
	if (color.startsWith("#")) {
		if (color.length === 4) {
			const hex = parseInt(color.slice(1), 16);
			return "Color.fromRGB(" + (((hex >> 8) & 0xF) * 17) + ", " + (((hex >> 4) & 0xF) * 17) + ", " + ((hex & 0xF) * 17) + ")";
		} else {
			const hex = parseInt(color.slice(1), 16);
			return "Color.fromRGB(" + ((hex >> 16) & 0xFF) + ", " + ((hex >> 8) & 0xFF) + ", " + (hex & 0xFF) + ")";
		}
	}
	if (color.startsWith("rgb")) {
		const rgb = color.match(/\d+/g);
		return "Color.fromRGB(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
	}
	if (color.startsWith("rgba")) {
		const rgb = color.match(/\d+/g);
		return "Color.fromRGBA(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + rgb[3] + ")";
	}
	if (color.startsWith("hsl")) {
		const hsl = color.match(/\d+/g);
		return "new Color(" + hsl[0] + ", " + hsl[1] + ", " + hsl[2] + ")";
	}
	if (color.startsWith("hsla")) {
		const hsl = color.match(/\d+/g);
		return "new Color(" + hsl[0] + ", " + hsl[1] + ", " + hsl[2] + ", " + hsl[3] + ")";
	}
	throw new Error("Invalid color format: " + color);
}

const defaultTheme = {
	territory: [],
	border: [],
	tiles: [],
	tileOverwrite: {},
	background: "#555",
	font: "Arial"
}

const components = {
	"h": "Hue",
	"s": "Saturation",
	"l": "Lightness",
	"a": "Alpha",
	"hue": "Hue",
	"saturation": "Saturation",
	"lightness": "Lightness",
	"alpha": "Alpha"
};

const functions = {
	"floor": {args: 1, func: "Math.floor($1)"},
	"ceil": {args: 1, func: "Math.ceil($1)"},
	"round": {args: 1, func: "Math.round($1)"},
	"abs": {args: 1, func: "Math.abs($1)"},
	"min": {args: 2, func: "Math.min($1, $2)"},
	"max": {args: 2, func: "Math.max($1, $2)"},
	"clamp": {args: 3, func: "Math.min(Math.max($1, $2), $3)"},
	"scale": {args: 3, func: "($1 + Math.floor($2 * $3))"},
	"scaleHue": {args: 2, func: "($1 + Math.floor(color.h / 360 * $2))"},
	"scaleSaturation": {args: 2, func: "($1 + Math.floor(color.s * $2))"},
	"scaleLightness": {args: 2, func: "($1 + Math.floor(color.l * $2))"},
	"scaleAlpha": {args: 2, func: "($1 + Math.floor(color.a * $2))"},
	"step": {args: 2, func: "Math.floor($1 / $2) * $2"}
}

function parseColorAction(actions) {
	let result = "color";
	for (const action of actions) {
		if (action.includes("=")) {
			const [component, value] = action.split("=");
			if (component.trim() in components) {
				result += ".with" + components[component.trim()] + "(" + parseColorExpression(value) + ")";
			} else {
				throw new Error("Invalid color component: " + component + " (expected explicit component)");
			}
		} else {
			const expression = parseColorExpression(action);
			let component = expression.match(/color\.[hsla]/g);
			if (!component) throw new Error("Invalid color expression: " + expression + " (no color component)");
			component = component.filter((value, index, self) => self.indexOf(value) === index);
			if (component.length === 1) {
				result += ".with" + components[component[0].slice(6)] + "(" + expression + ")";
			} else {
				throw new Error("Invalid color expression: " + expression + " (expected single component in implicit action)");
			}
		}
	}
	return result;
}

function parseColorExpression(expression) {
	if (expression.startsWith("(") && expression.endsWith(")")) {
		return `(${parseColorExpression(expression.slice(1, -1))})`;
	}

	const multiplications = [];
	const additions = [];
	for (let i = 0; i < expression.length; i++) {
		switch (expression[i]) {
			case "*":
			case "/":
				multiplications.push(i);
				break;
			case "+":
			case "-":
				additions.push(i);
				break;
			case "(":
				i = skipBrackets(expression, i);
				break;
			case ")":
				throw new Error("Unexpected ')'");
		}
	}

	if (multiplications.length > 0) {
		let result = parseColorExpression(expression.slice(0, multiplications[0]));
		for (let i = 0; i < multiplications.length; i++) {
			const op = expression[multiplications[i]];
			const next = i === multiplications.length - 1 ? expression.length : multiplications[i + 1];
			result += ` ${op} ${parseColorExpression(expression.slice(multiplications[i] + 1, next))}`
		}
		return result;
	}

	if (additions.length > 0) {
		let result = parseColorExpression(expression.slice(0, additions[0]));
		for (let i = 0; i < additions.length; i++) {
			const op = expression[additions[i]];
			const next = i === additions.length - 1 ? expression.length : additions[i + 1];
			result += ` ${op} ${parseColorExpression(expression.slice(additions[i] + 1, next))}`
		}
		return result;
	}

	if (expression.includes("(")) { // Function call
		const func = expression.slice(0, expression.indexOf("(")).trim();
		if (!(func in functions)) throw new Error("Unknown function: " + func);

		const args = [];
		let start = expression.indexOf("(") + 1;
		let depth = 0;
		for (let i = start; i < expression.length; i++) {
			if (expression[i] === "(") depth++;
			if (expression[i] === ")") depth--;
			if (depth === 0 && expression[i] === ",") {
				args.push(expression.slice(start, i));
				start = i + 1;
			}
		}
		if (start < expression.length) args.push(expression.slice(start, expression.length - 1));
		if (args.length !== functions[func].args) throw new Error("Invalid number of arguments for function " + func + ": " + args.length + " (expected " + functions[func].args + ")");
		return functions[func].func.replace(/\$(\d+)/g, (_, n) => parseColorExpression(args[n - 1]));
	}

	if (expression.trim() in functions && functions[expression.trim()].args === 0) {
		return functions[expression.trim()].func;
	}

	if (expression.trim() in components) {
		return "color." + components[expression.trim()].slice(0, 1).toLowerCase();
	}

	if (!Number.isNaN(Number(expression))) {
		return expression.trim();
	}

	throw new Error("Invalid expression: " + expression);
}

function skipBrackets(expression, offset) {
	let depth = 1;
	let i = offset + 1;
	while (depth > 0) {
		if (expression[i] === "(") depth++;
		if (expression[i] === ")") depth--;
		i++;
	}
	return i;
}