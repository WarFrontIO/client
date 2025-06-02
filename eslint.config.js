const eslint = require("@eslint/js");
const tslint = require("typescript-eslint");

module.exports = tslint.config(
    {
        files: ["src/**/*.ts"],
        extends: [
            eslint.configs.recommended,
            ...tslint.configs.strictTypeChecked
        ],
        rules: {
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: ["parameter", "variable"],
                    leadingUnderscore: "require",
                    format: ["camelCase"],
                    modifiers: ["unused"]
                },
                {
                    selector: ["parameter", "variable"],
                    leadingUnderscore: "allowDouble",
                    format: ["camelCase", "UPPER_CASE"]
                }
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_"
                }
            ],
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
            "@typescript-eslint/no-confusing-void-expression": [
                "warn",
                {
                    ignoreArrowShorthand: true
                }
            ],
            "@typescript-eslint/no-invalid-void-type": [
                "warn",
                {
                    allowAsThisParameter: true
                }
            ],
            "@typescript-eslint/restrict-template-expressions": [
                "warn",
                {
                    allowNumber: true
                }
            ],
	        "@typescript-eslint/prefer-nullish-coalescing": "error",
	        "@typescript-eslint/consistent-type-imports": "error"
        },
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname
            }
        },
        ignores: [
            "src/map/codec/src/util/ZoneCalculator.ts",
            "src/network/protocol/packet/handshake/HandshakeResponsePacket.ts"
        ]
	}
);