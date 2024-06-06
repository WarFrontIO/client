# HUD documentation

The HUD is comprised of "elements" which are basically individual pieces of the HUD which can be instantiated ("spawned") as many times as desired and at any location on the screen. Unlike UI modules, these can be instantiated as many times as you want

Elements have the `fixed` CSS position, so they are rendered irrespective of other HTML content, which is something that is important to remember when working with them.

Each element should have two things: a TypeScript file and an HTML file, preferably with the same name. These files should be located in `./src/hud/elements` to allow the build script to locate and inject the templates.

Here is some code for a basic example element, with explanatory comments:

**ExampleElement.ts**
```typescript
// The HudElement class is used as a
// base for all HUD elements.
//
// This relative path ("../HudElement") assumes the current
// file is located in ./src/hud/elements
import {HudElement} from "../HudElement";

export class ExampleElement extends HudElement {
	// Note that the element is not spawned when
	// the constructor is called.
	constructor() {
		// Calling super() is required.
		// The argument must match the name of
		// the template HTML file (sans the file extension)
		super("ExampleElement");
	}
}
```

**ExampleElement.html**
```html
<!-- Any valid HTML can be put here. -->
<button>Here's an example button.</button>
```

To use the element, it needs to be instantiated from someplace in your code- anywhere works!

A basic example that spawns the element upon instantiation looks like this:
```typescript
import {ExampleElement} from "/path/to/hud/elements/ExampleElement";

(new ExampleElement()).spawn(50, 50);
```

The numbers provided to `spawn()` are the coordinates to draw the element at.

You may retrieve and modify the corresponding HTML element with `HudElement.getElement()`. This is a getter for `HudElement.element`, which is an [`HTMLDivElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement).

For more information, refer to the JSDoc annotations in the source code :-)