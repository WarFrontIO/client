# HUD documentation

The HUD is a system of elements that are each represented by a TypeScript class extending off of `HudElement` (located in `./src/hud/HudElement.ts`)

Each element is unique and is created when the game is first loaded (when the `load` event is fired). Your element's class is instantiated here. You will only ever use the one instance.

You will also need an HTML file containing the actual HTML for the element. This works similar to the UI module system, but HUD elements are given `fixed` CSS positions and are hidden by default until you call your element's `show()` method.

## Example element setup

Each HUD element consists of two files, a TypeScript file containing the element's class and an HTML file containing the HTML to display (this can be changed by accessing the HTML div via `HudElement.getElement()`)

**ExampleElement.ts**

This is the file containing your element's main class. It needs to extend off of `HudElement`, which implements the basic functionality you'll need. You can read its methods and corresponding JSDoc comments to get an overview of what you can do with it.

```typescript
import {HudElement} from "../HudElement";

export class ExampleElement extends HudElement {
	// Note that this constructor is called as soon
	// as the page is loaded. If you don't want your
	// element showing up then, don't show it here.
	constructor() {
		// Calling super() is required, and the bare minimum for your element's
		// constructor. This binds the class to the HTML div.
		//
		// The argument must match the name of
		// the corresponding HTML file (sans the file extension)
		super("ExampleElement");
	}
}
```

**ExampleElement.html**

This file contains the HTML to be used for your HUD element. It is injected into the document during the build process, and you can use the `<ignore>` tag (just like with UI modules) to exclude parts of the HTML.

```html
<!-- Any valid HTML can be put here. -->
<button>Here's an example button.</button>
```

## Registering your HUD element

Registering your HUD element, so it actually shows up in the game, is very simple: just import it into `./src/hud/HudManager.ts` and call the constructor in `initHudElements()`.

Here's what it should look like:

```typescript
import {ExampleElement} from "./elements/ExampleElement";
import {SomeOtherElement} from "./elements/SomeOtherElement";

export function initHudElements() {
	new ExampleElement();
	new SomeOtherElement();
	// ...add more here!
}
```