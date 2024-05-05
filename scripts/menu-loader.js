const {readdirSync} = require("fs");

module.exports = async function (menu) {
	if (menu.includes("// BUILD_MODULE_REGISTER")) {
		console.log("Registering menus...");
		const menus = readdirSync("src/ui/modules").filter(file => file.endsWith(".ts"));
		const menuRegister = menus.map(file => "registerModule(\"" + file.replace(".ts", "") + "\", require(\"./modules/" + file + "\").default);").join("\n");
		menu = menu.replace("// BUILD_MODULE_REGISTER", "window.addEventListener(\"load\", function () {\n" + menuRegister + "\n});");
	}
	return menu;
}