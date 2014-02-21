# Spritemaker for SVG

[![Build Status](https://travis-ci.org/bryanburgers/spritemaker-svg.png?branch=master)](https://travis-ci.org/bryanburgers/spritemaker-svg)

Create an SVG sprite map from SVG sprites.

## Installation

```
npm install spritemaker-svg
```

## Use

```
var spritemaker = require('spritemaker-svg');

var sprites = [
	{ id: 'sprite1', stream: getSpriteReadableStream('sprite1') },
	{ id: 'sprite2', stream: getSpriteReadableStream('sprite2') },
	{ id: 'sprite3', stream: getSpriteReadableStream('sprite3') },
	{ id: 'sprite4', stream: getSpriteReadableStream('sprite4') }
]

var output = spritemaker(sprites);
// Pipe the resulting SVG somewhere.
output.pipe(process.stdout);
output.on('packed', function(data) {
	// The information about the sprite packing is available.

	// data.width: width of the resulting SVG
	// data.height: height of the resulting SVG
	// data.items: items within the sprite
	// data.items[0].id: the ID passed in.
	// data.items[0].x: the generated x coordinate of the sprite
	// data.items[0].x: the generated y coordinate of the sprite
	// data.items[0].width: the width of the sprite
	// data.items[0].height: the height of the sprite
});
```

## Contributing

Contributing tests, documentation, or code is all appreciated. All code should
be accompanied by valid tests.

## Limitations

* If two sprite SVGs have the same ID, it does not currently disambiguate
  them.
