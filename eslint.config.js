const eslint = require("@eslint/js");
const tslint = require("typescript-eslint");

module.exports = tslint.config(
    {
        files: ["src/**/*.ts"],
        extends: [
            eslint.configs.recommended,
            ...tslint.configs.recommendedTypeChecked
        ],
        rules: {
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    "selector": ["parameter", "variable"],
                    "leadingUnderscore": "require",
                    "format": ["camelCase"],
                    "modifiers": ["unused"]
                },
                {
                    "selector": ["parameter", "variable"],
                    "leadingUnderscore": "allowDouble",
                    "format": ["camelCase", "UPPER_CASE"]
                }
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_"
                }
            ],
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-empty-object-type": "off"
        },
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname
            }
        }
    }
);