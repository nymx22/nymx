/**
 * Brick Floor Generator
 * Cuts 30 random square pieces from brick.jpg and tiles them on the floor
 * 4 rows vertically, as many columns as needed horizontally
 */

export function initBrickFloor() {
  return new Promise((resolve, reject) => {
    const floorSection = document.querySelector('.floor-section');
    
    if (!floorSection) {
      console.error('Floor section not found');
      reject(new Error('Floor section not found'));
      return;
    }

    // Remove any existing brick tiles before re-rendering
    const existing = floorSection.querySelector('.brick-container');
    if (existing) {
      existing.remove();
    }

    // Indicate rebuild for smoother transition
    floorSection.classList.add('rebuilding');
    const cleanupRebuildIndicator = () => {
      floorSection.classList.remove('rebuilding');
    };

    // Load the brick image
    const img = new Image();
    img.src = '../assets/images/brick.jpg';
    
    img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw the image on canvas
    ctx.drawImage(img, 0, 0);
    
    // Configuration
    const totalPieces = 20;
    const verticalTiles = 3;
    
    // Get floor dimensions
    const floorWidth = floorSection.offsetWidth;
    const floorHeight = floorSection.offsetHeight;
    
    // Calculate tile height (floor divided by 4 rows)
    const tileHeight = floorHeight / verticalTiles;
    const tileWidth = tileHeight; // Square tiles
    
    // Calculate how many columns fit horizontally
    const horizontalTiles = Math.ceil(floorWidth / tileWidth);
    
    // Determine square size to cut from image (use smaller dimension)
    const maxSquareSize = Math.min(img.width, img.height);
    const squareSize = Math.floor(maxSquareSize / 4);
    
    // Pre-calculate values
    const maxX = img.width - squareSize;
    const maxY = img.height - squareSize;
    const totalTiles = verticalTiles * horizontalTiles;
    
    // Create single reusable canvas for all pieces (optimization)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = squareSize;
    tempCanvas.height = squareSize;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: false });
    
    // Generate random positions once
    const positions = Array.from({ length: totalPieces }, () => ({
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY)
    }));
    
    // Create randomized tile indices (combine shuffle into generation)
    const tileIndices = Array.from({ length: totalTiles }, (_, i) => i % totalPieces);
    for (let i = tileIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileIndices[i], tileIndices[j]] = [tileIndices[j], tileIndices[i]];
    }
    
    // Create container and fragment for batch DOM insertion
    const brickContainer = document.createElement('div');
    brickContainer.className = 'brick-container';
    const fragment = document.createDocumentFragment();
    
    // Single loop: create and place all tiles
    for (let i = 0; i < totalTiles; i++) {
      const pieceIndex = tileIndices[i];
      const pos = positions[pieceIndex];
      
      // Draw piece to temp canvas
      tempCtx.clearRect(0, 0, squareSize, squareSize);
      tempCtx.drawImage(img, pos.x, pos.y, squareSize, squareSize, 0, 0, squareSize, squareSize);
      
      // Create tile element
      const pieceDiv = document.createElement('div');
      pieceDiv.className = 'brick-piece';
      
      // Calculate position
      const col = i % horizontalTiles;
      const row = Math.floor(i / horizontalTiles);
      
      // Set styles (use cssText for better performance)
      pieceDiv.style.cssText = `
        left: ${col * tileWidth}px;
        top: ${row * tileHeight}px;
        width: ${tileWidth}px;
        height: ${tileHeight}px;
        background-image: url(${tempCanvas.toDataURL('image/webp', 0.8)});
      `;
      
      fragment.appendChild(pieceDiv);
    }
    
    // Single DOM operation
    brickContainer.appendChild(fragment);
    
      // Clear existing floor background and add brick container
      floorSection.style.backgroundImage = 'none';
      floorSection.appendChild(brickContainer);
      
      console.log(`Brick floor initialized: ${verticalTiles} rows × ${horizontalTiles} cols using ${totalPieces} random pieces`);
      
      // Remove rebuild indicator
      cleanupRebuildIndicator();
      
      // Resolve promise when complete
      resolve();
    };
    
    img.onerror = () => {
      console.error('Failed to load brick.jpg');
      cleanupRebuildIndicator();
      reject(new Error('Failed to load brick.jpg'));
    };
  });
}

