const {readdirSync} = require("fs");

module.exports = async function (menu) {
	if (menu.includes("// BUILD_MODULE_REGISTER")) {
		console.log("Registering menus...");
		const menus = readdirSync("src/ui/element/static").filter(file => file.endsWith(".html"));
		const menuRegister = menus.map(file => "loadStaticElement(\"" + file.replace(".html", "") + "\");").join("\n");
		const scripts = readdirSync("src/ui/element").filter(file => file.endsWith(".ts"));
		const scriptRegister = scripts.map(file => "require(\"./element/" + file.replace(".ts", "") + "\");").join("\n");
		menu = menu.replace("// BUILD_MODULE_REGISTER", "window.addEventListener(\"load\", function () {\n" + menuRegister + "\n" + scriptRegister + "});");
	}
	return menu;
}