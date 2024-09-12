# Element documentation

Elements are parts of the user interfaces used to interact with the rest of the game.
They are automatically injected into the game on build and can be opened at any time on runtime.

## How to create an element

An element consists of a single HTML file in the `src/ui/element/static` directory. <br>
The name will later be used to load the element in the game and should be unique. Please use PascalCase for the name.

#### HTML file:

- do not add a head or body tag, the content will be injected into the game's body tag
- you can use the `<ignore>` tag to prevent specific parts of the element from being injected into the game (e.g. to load
  the stylesheet, which is also loaded by the game directly)
- you can directly edit elements without having to compile the game (just open them as a normal html file)

#### Adding behavior:

Most elements will need some TypeScript code to e.g. handle button clicks. This code should be placed in an appropriate file in the `src/ui/element` directory. Or create a new file if necessary.

Elements can listen to events using the functions of the `UIEventResolver`, e.g. `registerClickListener("buttonId", () => { /* do something */ });`.
For non-game relevant events (like text input), normal dom event listeners can be used.
Some common use-cases like validated inputs have utility classes in the `src/ui/type` directory.

## Loading an element

To load an element, use the `showUIElement` function in the game:

```typescript
showUIElement("ElementName");
```