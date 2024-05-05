# Module documentation

Modules are mostly one-page user interfaces used to interact with the rest of the game.
They are automatically injected into the game on build and can be opened at any time on runtime.

## How to create a module

A module consists of a single HTML file and a TypeScript file in the `src/ui/modules` directory. <br>
Both file must have the same name, the name will later be used to load the module in the game.

#### HTML file:

- do not add a head or body tag, the content will be injected into the game's body tag
- you can use the `<ignore>` tag to prevent specific parts of the module from being injected into the game (e.g. to load
  the stylesheet, which is also loaded by the game directly)
- you can directly edit modules without having to compile the game (just open them as a normal html file)

#### TypeScript file:

This file is used to define functions needed by the module. <br>
Normal functions of the game need to be proxied as follows:

```typescript
(window as any).commandExampleButton = function () {
	// your code here (normal game code is available here)
};
```

Then you can call the function normally in the HTML file like this:

```html
<button onclick="window.commandExampleButton()">Example Button</button>
```

Since some linters may not correctly identify the scope of this function, please prefix the function name with `command`
to avoid conflicts with other functions. <br>

Some modules may require dynamic content (e.g. player statistics). In this case, use module events:

```typescript
// noinspection JSUnusedGlobalSymbols
export default {
	onOpen: () => {
		// your code here
	}
} as ModuleAdapter;
```

The `onOpen` function is called when the module is opened. <br>

## Loading a module

To load a module, use the `openMenu` function in the game:

```typescript
openMenu("ModuleName");
```