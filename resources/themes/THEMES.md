# Theme documentation

Themes are used to change the appearance of the game. 
They are injected into the game on build and can be changed at any time on runtime.

## How to create a theme

A theme consists of a single css and json file in the `resources/themes` directory. <br>
Both files must have the same name, the name will later be used to load the theme in the game.

#### CSS file:

Define any rules here, refer to other themes for classes and ids to style

Themes should always start with `@import "../base.css";`, while this doesn't actually affect the theme when imported into the game, it is important for the theme preview in your browser. <br>

Pro-tip: Head over to one of the modules [here](/src/ui/modules) and paste / modify the following code to see the theme in action, without having to compile the game:
```html
<ignore>
	<link rel="stylesheet" type="text/css" href="../../../resources/themes/<yourtheme>.css">
</ignore>
```

#### JSON file:

The JSON file defines the theming of the game map. <br>
Rendered tiles are styled on a per-type basis, with the following types available:
- `territory` for player territories
- `border` for player borders (same base color as territory)
- `tiles` for map tiles (the map background itself)

#### Expression syntax

Based on a base-color, you can modify the color to fit your theme. <br>
All colors are manipulated using the [HSLA color space](https://en.wikipedia.org/wiki/HSL_and_HSV). <br>
The following properties are available:
- `hue` for the color hue (0-360)
- `saturation` for the color saturation (0-1)
- `lightness` for the color lightness (0-1)
- `alpha` for the color alpha (transparency) (0-1)

you can freely set, multiply or add to these values using a simple mathematical syntax: <br>
e.g. `hue + 180` will shift the hue by 180 degrees, `lightness * 0.5` will half the lightness, `alpha = 0.5` will set the alpha to 0.5

Color components not defined in the theme will not be modified.

There are also some utility functions available:
- scaling functions: `scaleHue(<min>, <max>)`, `scaleSaturation(<min>, <max>)`, `scaleLightness(<min>, <max>)`, `scaleAlpha(<min>, <max>)` to bring a value in the range of min to max (values will keep their relative distance)
- rounding functions: `round(<value>)`, `floor(<value>)`, `ceil(<value>)`
- `min(<value1>, <value2>)` to get the minimum of two values
- `max(<value1>, <value2>)` to get the maximum of two values
- `clamp(<min>, <value>, <max>)` to clamp a value between min and max (Warning: the min and max values will be very common)
- `step(<value>, <distance>)` to force a value to be one of a set of steps (multiple of distance)

Some examples:
- `step(hue, 30)` will force the hue to be a multiple of 30
- `scaleLightness(0.6, 0.8)` will scale the lightness to be between 0.6 and 0.8
- `min(alpha, 0.5)` will set the alpha to 0.5 if it is below 0.5
- `step(clamp(0.2, saturation, 0.8), 0.1)` will clamp saturation between 0.2 and 0.8 and floor it to the nearest 0.1

If needed, you can make components dependent on each other by using the `=` operator, the operator is needed when multiple components are used in the same expression. <br>
e.g. `alpha = 0.5 + step(hue, 30) * 0.1` will set the alpha to 0.5 and add 0.1 for every 30 degrees of hue
Note, that the expressions will be evaluated in the order you define them in the JSON file, so they don't necessarily have the original values (you can change the order to get the desired result).

#### Tile overwrites

To better fine-tune the appearance of the map, you can overwrite the default tile colors. <br>
This is done by adding a `tileOverwrites` object to the JSON file. <br>

The object has to be structured as follows:
```json
{
    "tileOverwrites": {
        "<tileId>": "<color>"
    }
}
```

where `<tileId>` is the id of the tile you want (e.g. `grass` or `water`) and `<color>` is the color you want to set. <br>
The color can be in hex, rgb(a) or hsl(a) format.

#### Shaders

Shaders can be used to apply effects to the game. <br>

The following shaders are available:
- `territory-outline` to add an outline around land territories on the map (applies to the water around the territory). Arguments: `color`, `thickness`
- `territory-inline` to add an inline around land territories on the map (applies to the territory next to the water). Arguments: `color`, `thickness`
- `territory-outline-smooth` to add a gradient outline around land territories on the map (applies to the water around the territory). Arguments: `color`, `thickness`
- `territory-inline-smooth` to add a gradient inline around land territories on the map (applies to the territory next to the water). Arguments: `color`, `thickness`
- `fixed-distance` to shade all tiles based on their distance to the nearest non-solid tile (negative if the tile is non-solid). Arguments: `color`, `min`, `max`
- `dynamic-distance` to apply a gradient to all tiles based on their distance to the nearest non-solid tile (negative if the tile is non-solid). Arguments: `color`, `min`, `max`, `gradient`

#### Misc properties

You can also define the following properties in the JSON file:
- `background` to set the background color of the game
- `font` to set the font used in the game

#### Full example theme

```json
{
  "territory": [
    "saturation * 0.8",
    "scaleLightness(0.6, 0.8)",
    "alpha = 0.5 + step(hue, 30) * 0.1"
  ],
  "border": [
    "hue + 180"
  ],
  "tiles": [
    "max(0.5, lightness * 0.8)"
  ],
  "tileOverwrites": {
    "grass": "hsl(120, 50%, 50%)",
    "water": "hsl(200, 50%, 50%)"
  },
  "shaders": [
    {
      "type": "territory-outline-smooth",
      "color": "rgba(0, 0, 0, 0.1)",
      "thickness": 4
    },
    {
      "type": "fixed-distance",
      "color": "rgba(0, 0, 0, 0.5)",
      "min": 5,
      "max": 10
    }
  ],
  "background": "#555",
  "font": "Arial"
}
```