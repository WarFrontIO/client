const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

module.exports = {
	mode: "development",
	entry: {
		main: "./src/Loader.ts"
	},
	output: {
		publicPath: "/",
		path: path.resolve(__dirname, './build'),
		filename: "[name]-bundle.js"
	},
	resolve: {
		extensions: [".ts"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader"
			}
		]
	},
	plugins: [new HtmlWebpackPlugin({
		template: "./src/template.html"
	}), new HtmlInlineScriptPlugin()]
};