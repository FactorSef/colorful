# @factor-sef/colorful

Color object for working in JavaScript. Based on [CSS Color Module Level 4](https://drafts.csswg.org/css-color/#introduction).

## Instalation

```bash
npm install @factor-sef/colorful
```

## Usage

```TypeScript
import Color from '@factor-sef/colorful';

const color = new Color('#ffffff');

console.log(color.toRgbString()) // => 'rgb(255, 255, 255)'
```

## Roadmap

- [x] Work with HEX
- [x] Work with RGB
- [x] Work with HSL
- [x] Work with HWB
- [ ] Get/set hue rotation
- [x] Get/set alpha
- [ ] Get/set satudation
- [ ] Get/set lightness
- [ ] Get/set blackness
- [ ] set scale
- [ ] set greyscale
