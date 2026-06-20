import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupPluginRules } from "@eslint/compat";
import _import from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";
import nodePlugin from "eslint-plugin-n";
import globals from "globals";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pluginSecurity from "eslint-plugin-security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended
});

export default tseslint.config(
	{
		ignores: ["**/dist", "**/node_modules"]
	},

	js.configs.recommended,
	...compat.extends("plugin:prettier/recommended"),
	nodePlugin.configs["flat/recommended-script"],
	...tseslint.configs.recommended.map((config) => ({
		...config,
		files: ["**/*.ts", "**/*.tsx"]
	})),
	pluginSecurity.configs.recommended,

	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: true
			}
		},
		rules: {
			"n/no-missing-import": "off",
			"n/no-unsupported-features/node-builtins": "off",
			"@typescript-eslint/no-shadow": "error",
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-empty-object-type": "off"
		},
		settings: {
			"import/resolver": {
				typescript: true,
				node: true
			}
		}
	},
	{
		files: ["eslint.config.mjs"],
		rules: {
			"n/no-unpublished-import": "off"
		}
	},

	{
		plugins: {
			import: fixupPluginRules(_import),
			prettier
		},

		languageOptions: {
			globals: {
				...globals.node
			},
			ecmaVersion: "latest",
			sourceType: "module"
		},

		rules: {
			semi: ["error", "always"],
			camelcase: "off",
			"no-console": "off",
			"no-shadow": "off",
			"import/no-namespace": "off",
			"prettier/prettier": "error"
		}
	}
);
