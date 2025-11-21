/**
 * Pebble Floor Generator
 * Cuts 30 random square pieces from pebble.png and tiles them on the floor
 * 4 rows vertically, as many columns as needed horizontally
 */

export function initPebbleFloor() {
  const floorSection = document.querySelector('.floor-section');
  
  if (!floorSection) {
    console.error('Floor section not found');
    return;
  }

  // Load the pebble image
  const img = new Image();
  img.src = '../assets/images/pebble.jpg';
  
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
    const squareSize = Math.floor(maxSquareSize / 4); // Cut larger squares (was /6)
    
    // Create 30 random square pieces from the image
    const pieces = [];
    for (let i = 0; i < totalPieces; i++) {
      // Random position in the source image (ensuring square fits)
      const maxX = img.width - squareSize;
      const maxY = img.height - squareSize;
      const randomX = Math.floor(Math.random() * maxX);
      const randomY = Math.floor(Math.random() * maxY);
      
      // Create a canvas for this piece
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = squareSize;
      pieceCanvas.height = squareSize;
      const pieceCtx = pieceCanvas.getContext('2d');
      
      // Draw the random square from the source image
      pieceCtx.drawImage(
        img,
        randomX, randomY, // source x, y
        squareSize, squareSize, // source width, height
        0, 0, // destination x, y
        squareSize, squareSize // destination width, height
      );
      
      pieces.push(pieceCanvas.toDataURL());
    }
    
    // Shuffle the pieces array for random order
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    
    // Create container for pebble pieces
    const pebbleContainer = document.createElement('div');
    pebbleContainer.className = 'pebble-container';
    
    // Create randomized tile order
    const totalTiles = verticalTiles * horizontalTiles;
    const tileOrder = [];
    for (let i = 0; i < totalTiles; i++) {
      tileOrder.push(pieces[i % totalPieces]);
    }
    
    // Shuffle the tile order for random placement
    for (let i = tileOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileOrder[i], tileOrder[j]] = [tileOrder[j], tileOrder[i]];
    }
    
    // Place pieces in grid with randomized order
    let tileIndex = 0;
    for (let row = 0; row < verticalTiles; row++) {
      for (let col = 0; col < horizontalTiles; col++) {
        // Use randomized tile order
        const pieceData = tileOrder[tileIndex++];
        
        // Create a div to hold this piece
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'pebble-piece';
        
        // Position in grid
        const posX = col * tileWidth;
        const posY = row * tileHeight;
        
        // Set position and size via inline styles (dynamic values)
        pieceDiv.style.left = `${posX}px`;
        pieceDiv.style.top = `${posY}px`;
        pieceDiv.style.width = `${tileWidth}px`;
        pieceDiv.style.height = `${tileHeight}px`;
        pieceDiv.style.backgroundImage = `url(${pieceData})`;
        
        pebbleContainer.appendChild(pieceDiv);
      }
    }
    
    // Clear existing floor background and add pebble container
    floorSection.style.backgroundImage = 'none';
    floorSection.appendChild(pebbleContainer);
    
    console.log(`Pebble floor initialized: ${verticalTiles} rows × ${horizontalTiles} cols using ${totalPieces} random pieces`);
  };
  
  img.onerror = () => {
    console.error('Failed to load pebble.png');
  };
}

