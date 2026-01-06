# Pole Slider - Portable Version

A minimalist telephone pole scene with interactive sliders for customization.

## Features
- **Count**: Number of poles (2-10)
- **Depth**: Perspective/depth effect (0-100)
- **Sag**: Wire sag/curve (0-100)
- **X Sine**: Horizontal sine wave pattern (0-10)
- **Y Sine**: Vertical sine wave pattern (0-10)
- **Pixel**: Pixelation effect (0-50)
- **Noise**: Digital noise/TV static effects
  - Level (0-100)
  - Speed (0-50)

## Usage

Simply open `index.html` in a web browser. No server required!

All dependencies are loaded via CDN:
- p5.js (v1.8.0)
- dat.GUI (v0.7.7)
- Adobe Typekit font

## Files Structure
```
pole-slider-portable/
├── index.html          # Main HTML file
├── frame.js            # Main sketch logic
├── iconpole.png        # Favicon
├── classes/
│   ├── Pole.js         # Pole object class
│   ├── Wire.js         # Wire object class
│   └── NoiseTexturePool.js  # Noise texture management
└── css/
    ├── style.css       # Basic page styles
    └── gui.css         # dat.GUI custom styles
```

## Portable
This folder is completely self-contained and can be moved to any location. Just maintain the folder structure and open `index.html` in any modern web browser.

