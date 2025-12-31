# Website Performance Optimization Recommendations

## Current Performance Issues Identified

### 1. Large Asset Files
- **Audio**: `Solo from More Travels.mp3` - **5.0MB** (should be compressed)
- **Images**: 
  - `self4.PNG` - **5.1MB** (should be optimized/compressed)
  - `pebble.jpg` - **5.3MB** (should be optimized)
  - `brick.jpg` - **2.7MB** (should be optimized)
  - `humanoid.gif` - **2.2MB** (consider converting to video or optimizing)

### 2. Loading Strategy Issues
- Audio uses `preload="auto"` - loads immediately on page load
- Multiple CSS files loaded synchronously
- External fonts loaded from Google Fonts and Typekit (blocking)
- Some scripts not using `defer` or `async`

## Recommended Optimizations

### Priority 1: Asset Optimization (Biggest Impact)

#### 1.1 Compress Audio File
```bash
# Convert to OGG Vorbis (better compression, smaller file)
ffmpeg -i "assets/audio/Solo from More Travels.mp3" -codec:a libvorbis -qscale:a 5 "assets/audio/Solo from More Travels.ogg"

# Or use lower bitrate MP3
ffmpeg -i "assets/audio/Solo from More Travels.mp3" -b:a 128k "assets/audio/Solo from More Travels-compressed.mp3"
```
**Expected savings**: 5MB → ~1-2MB (60-80% reduction)

#### 1.2 Optimize Large Images
```bash
# For PNG files (self4.PNG, self0.PNG)
pngquant --quality=65-80 assets/images/self/self4.PNG --output assets/images/self/self4-optimized.PNG

# For JPG files (pebble.jpg, brick.jpg)
jpegoptim --max=85 --strip-all assets/images/pebble.jpg
jpegoptim --max=85 --strip-all assets/images/brick.jpg
```
**Expected savings**: 
- PNG: 5.1MB → ~500KB-1MB (80-90% reduction)
- JPG: 5.3MB → ~500KB-1MB (80-90% reduction)

#### 1.3 Convert GIF to Video (WebM/MP4)
```bash
# Convert humanoid.gif to WebM (much smaller)
ffmpeg -i assets/gif/humanoid.gif -c:v libvpx-vp9 -b:v 500k -c:a libvorbis assets/gif/humanoid.webm

# Or MP4 for better compatibility
ffmpeg -i assets/gif/humanoid.gif -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k assets/gif/humanoid.mp4
```
**Expected savings**: 2.2MB → ~200-400KB (80-90% reduction)

### Priority 2: Loading Strategy

#### 2.1 Lazy Load Audio
Change `preload="auto"` to `preload="none"` or `preload="metadata"`:
```html
<!-- Current -->
<audio id="background-music" loop preload="auto">

<!-- Optimized -->
<audio id="background-music" loop preload="metadata">
```
Audio will only load when user interacts (plays music).

#### 2.2 Add Image Lazy Loading
```html
<!-- For images that are below the fold -->
<img src="..." loading="lazy" alt="...">
```

#### 2.3 Use Font Display Swap
```css
@font-face {
  font-family: 'Hershey-Noailles-Futura-Triplex-Bold';
  src: url('...') format('woff');
  font-display: swap; /* Add this */
}
```

#### 2.4 Combine CSS Files (Optional)
Consider combining multiple CSS files into one to reduce HTTP requests.

#### 2.5 Add Resource Hints
```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- DNS prefetch for CDNs -->
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
```

### Priority 3: Code Optimization

#### 3.1 Use Modern Image Formats
- Convert PNG to WebP where possible
- Use `<picture>` element with fallbacks:
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="...">
</picture>
```

#### 3.2 Defer Non-Critical Scripts
```html
<!-- Already using defer for p5.js in some pages -->
<script src="..." defer></script>
```

#### 3.3 Code Splitting
- Load tool-specific code only on tool pages
- Use dynamic imports for heavy modules

### Priority 4: Caching & Compression

#### 4.1 Enable Gzip/Brotli Compression
Configure your web server to compress files:
- Nginx: `gzip on;`
- Apache: Enable mod_deflate

#### 4.2 Add Cache Headers
```html
<!-- In .htaccess or server config -->
<FilesMatch "\.(jpg|jpeg|png|gif|woff|woff2|mp3|ogg)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

## Implementation Priority

1. **Immediate (Biggest Impact)**:
   - Compress audio file (5MB → 1-2MB)
   - Optimize large images (self4.PNG, pebble.jpg, brick.jpg)
   - Change audio preload to "metadata"

2. **Short-term**:
   - Convert GIF to video format
   - Add lazy loading for images
   - Add font-display: swap

3. **Medium-term**:
   - Implement WebP images with fallbacks
   - Combine CSS files
   - Add resource hints

4. **Long-term**:
   - Code splitting
   - Service worker for caching
   - CDN for static assets

## Expected Results

After implementing Priority 1 optimizations:
- **Initial page load**: ~15MB → ~3-5MB (70% reduction)
- **Time to Interactive**: Significantly faster
- **First Contentful Paint**: Much improved

## Tools for Testing

- Chrome DevTools Lighthouse
- WebPageTest.org
- PageSpeed Insights
- Network tab in DevTools

