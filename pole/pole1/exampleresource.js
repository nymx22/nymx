let fontFile = 'assets/fonts/Rand-Medium_1.ttf';
let font;

let gui;

const params = {
    text: "R&D",

    fontsize: 350,
    textAlign: 'CENTER', // Possible values: 'LEFT', 'CENTER', 'RIGHT'
    lineSpacing: 0.85, // Multiplier for default line spacing
    textX: 0, // Text X position
    textY: 220, // Text Y position

    perlinseed: 43758.5453,
    perlinscale: 1.0,
    perlinspeed: 0.0, //0.15
    dIntensity: 0.003,
    mix: 0.0,
    scaleFactor: 0.4,
    expandFactor: 0.0,
    caIntensity: 0.000,
    flicker: true,
    frequency: 1.0,
    contrast1: 1.0,
    contrast2: 0.0,
    blurIntensity: 0.01,
    typesettingImageIndex: '',
    noiseImageIndex: '',

    noiseType: 3, // Default noise type
    viewMode: 0, // Default view mode

};

const viewModes = {
    'Normal': 0,
    'Double Vision': 1,
    'Overlay': 2,
};

const noiseTypes = {
    'Perlin': 0,
    'Worley Edged': 1,
    'Worley': 2,
    'Manhattan': 3,
    'Voronoi': 4,
    'Circle': 5,
};


let typesettingImageControl;
let noiseImageControl;






const params_preset1 = {
    perlinscale: 1.5,
    dIntensity: 0.003,
    mix: 0.0,
    scaleFactor: 0.4,
    expandFactor: 0.0,
    caIntensity: 0.000,
    flicker: true,
    frequency: 1.0,
    contrast1: 1.0,
    contrast2: 0.0,

    noiseType: 0,
    perlinspeed: 0.15,

};

const params_preset2 = {
    perlinscale: 3.0,
    dIntensity: 0.0015,
    mix: 0.06,
    scaleFactor: 0.2,
    expandFactor: 0.0,
    caIntensity: 0.001,
    flicker: false,
    frequency: 1.0,
    contrast1: 1.0,
    contrast2: 0.0,

    noiseType: 3,
    perlinspeed: 0.15,
};

const params_preset3 = {
    perlinscale: 4.5,
    dIntensity: 0.003,
    mix: 0.03,
    scaleFactor: 0.0,
    expandFactor: 1.5,
    caIntensity: 0.0,
    flicker: false,
    frequency: 1.0,
    contrast1: 1.0,
    contrast2: 0.0,

    noiseType: 2,
    perlinspeed: 0.15,
};

const params_preset4 = {
    perlinscale: 1.0,
    dIntensity: 0.003,
    mix: 0.0,
    scaleFactor: 0.5,
    expandFactor: 0.0,
    caIntensity: 0.0,
    flicker: true,
    frequency: 10.0,
    contrast1: 0.2,
    contrast2: 0.01,

    noiseType: 4,
    perlinspeed: 0.15,
};

const params_preset5 = {
    perlinscale: 6.0,
    dIntensity: 0.0044,
    mix: 0.076,
    scaleFactor: 0.28,
    expandFactor: 0.0,
    caIntensity: 0.0012,
    flicker: true,
    frequency: 1.0,
    contrast1: 1.0,
    contrast2: 0.0,

    noiseType: 3,
    perlinspeed: 0.0,
};

const params_preset6 = {
    perlinscale: 6.0,
    dIntensity: 0.007,
    mix: 0.17,
    scaleFactor: 0.43,
    expandFactor: 5.0,
    caIntensity: 0.004,
    flicker: true,
    frequency: 1.0,
    contrast1: 0.0,
    contrast2: 0.43,

    noiseType: 4,
    perlinspeed: 0.0,
};


const params_preset_random = {
    perlinscale: 0,
    dIntensity: 0,
    mix: 0,
    scaleFactor: 0,
    expandFactor: 0,
    caIntensity: 0,
    flicker: true,
    frequency: 0,
    contrast1: 0,
    contrast2: 0,
    noiseType: 0,
    perlinspeed: 0.0,
};



let wordTexture;

let noiseTextureA;
let noiseShaderA;

// let noiseTextureB;
// let noiseShaderB;

let bufferA;
let bufferAShader;

var frameCount = 0;

function preload() {
    font = loadFont(fontFile);
    noiseShaderA = loadShader('vertex.vert', 'noiseShaderA.frag');
    // noiseShaderB = loadShader('vertex.vert', 'noiseShaderB.frag');
    bufferAShader = loadShader('vertex.vert', 'bufferA.frag');
}

let size = [800,800];

function setup() {
    createCanvas(size[0], size[1], WEBGL);


    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = 'multiple';
    fileInput.style.display = 'none'; // Hide the input
    fileInput.addEventListener('change', (event) => {
        handleImageUpload(event.target.files); // Handle multiple files
    });
    document.body.appendChild(fileInput);



    // CREATE FONT TEXTURE
    wordTexture = createGraphics(width, height);
    cacheInput();

    noiseTextureA = createGraphics(size[0], size[1], WEBGL);
    // noiseTextureB = createGraphics(size[0], size[1], WEBGL);
    bufferA = createGraphics(size[0], size[1], WEBGL);

    // Initialize dat.GUI
    gui = new dat.GUI({hideable: false});


    const presetsFolder = gui.addFolder('Presets');
    // presetsFolder.open();

    presetsFolder.add({preset1: () => applyPreset(params_preset1)}, 'preset1').name('Wood Grain');
    presetsFolder.add({preset2: () => applyPreset(params_preset2)}, 'preset2').name('Chroma');
    presetsFolder.add({preset3: () => applyPreset(params_preset3)}, 'preset3').name('Ink Bleed');
    presetsFolder.add({preset4: () => applyPreset(params_preset4)}, 'preset4').name('Op Art');
    presetsFolder.add({preset5: () => applyPreset(params_preset5)}, 'preset5').name('Old TV');
    presetsFolder.add({preset6: () => applyPreset(params_preset6)}, 'preset6').name('Fragments');
    presetsFolder.add({presetr: () => applyPresetRandom()}, 'presetr').name('Random');


    // Type Setting Controls
    const inputSettingsFolder = gui.addFolder('Input');
    // inputSettingsFolder.open();

    // inputSettingsFolder.add(params, 'word').name('Text').onChange(updateWord);
    
    // Create a dummy controller as a placeholder
    let dummyController = inputSettingsFolder.add(params, 'text').name("Multiline Text");
    
    // Find the input element in the dummy controller and replace it with a textarea
    let controllerDom = dummyController.__li.getElementsByTagName('input')[0];
    let textarea = document.createElement('textarea');
    textarea.style.width = '100%'; // Match width
    textarea.style.boxSizing = 'border-box'; // Ensure padding does not affect width
    textarea.style.resize = 'none'; // Prevent resizing
    textarea.rows = 6; // Initial number of rows
    
    // Copy the text from params.text to the textarea
    textarea.value = params.text;
    
    // Replace the dummy input with the textarea
    controllerDom.parentNode.replaceChild(textarea, controllerDom);
    
    // Update params.text whenever the textarea changes
    textarea.addEventListener('input', function() {
        params.text = this.value;
        updateWord();
    });
    // Prevent GUI shortcuts when typing inside the textarea
    textarea.addEventListener('keydown', e => e.stopPropagation());

    dummyController.__li.classList.add("mltext");



    inputSettingsFolder.add(params, 'fontsize', 100, 800).name('Font Size').onChange(updateWord);

    inputSettingsFolder.add(params, 'textAlign', ['LEFT', 'CENTER', 'RIGHT']).onChange(updateWord);
    inputSettingsFolder.add(params, 'lineSpacing', 0, 3).step(0.01).onChange(updateWord);
    inputSettingsFolder.add(params, 'textX', -width, width).step(10).onChange(updateWord);
    inputSettingsFolder.add(params, 'textY', -height, height).step(10).onChange(updateWord);


    // Map Controls
    const mapSettingsFolder = gui.addFolder('Map');
    mapSettingsFolder.add(params, 'noiseType', noiseTypes).name('Noise Type').onChange(updateNoiseType);
    mapSettingsFolder.add(params, 'viewMode', viewModes).name('View Mode');
    mapSettingsFolder.add(params, 'perlinseed', 1, 100000).step(0.0001).name('N Seed');
    mapSettingsFolder.add(params, 'perlinscale', 1, 20).step(0.01).name('N Scale');
    mapSettingsFolder.add(params, 'perlinspeed', 0, 1).step(0.01).name('N Speed');


    const overwriteFolder = gui.addFolder('Overwrite');
    overwriteFolder.add({ triggerFileInput: () => fileInput.click() }, 'triggerFileInput').name('Upload Images');

    
    // Displace Controls
    const displaceSettingFolder = gui.addFolder('Displace');
    displaceSettingFolder.add(params, 'mix', 0.0, 1.0).step(0.001).name('Mix');
    
    displaceSettingFolder.add(params, 'dIntensity', 0.000, 0.007).step(0.0001).name('Displacement');
    displaceSettingFolder.add(params, 'scaleFactor', 0.00, 1.00).step(0.01).name('Zoom');
    displaceSettingFolder.add(params, 'expandFactor', 0.00, 5.00).step(0.01).name('Expand');
    displaceSettingFolder.add(params, 'caIntensity', 0.000, 0.005).step(0.0001).name('Aberration');

    // gui.add(params, 'blurIntensity', 0.00, 20.00).step(0.01).name('Blur');


    // Noise Controls
    const flickerSettingFolder = gui.addFolder('Flicker');
    flickerSettingFolder.add(params, 'flicker').name('Flicker');
    flickerSettingFolder.add(params, 'frequency', 1, 20).step(1.0).name('Frequency');
    flickerSettingFolder.add(params, 'contrast1', 0, 1).step(0.01).name('Contrast1');
    flickerSettingFolder.add(params, 'contrast2', 0, 1).step(0.01).name('Contrast2');
    // flickerSettingFolder.add(params, 'perlinscale', 1, 10).step(0.01).name('N Scale');
    // flickerSettingFolder.add(params, 'perlinspeed', 0, 1).step(0.01).name('N Speed');



    applyPreset(params_preset1);








}

function draw() {
    background(0);
    frameCount++;


    cacheMap();

    
    // Update Buffer A
    bufferAShader.setUniform('uResolution', [width, height]);
    bufferAShader.setUniform('time', millis() * 0.001);
    bufferAShader.setUniform('iChannel0', bufferA); // Current state
    bufferAShader.setUniform('iChannel1', noiseTextureA); // Noise texture A
    bufferAShader.setUniform('iChannel2', wordTexture); // wordTexture as initial state
    bufferAShader.setUniform('dIntensity', params.dIntensity); 
    bufferAShader.setUniform('mixfactor', params.mix); 
    bufferAShader.setUniform('scaleFactor', params.scaleFactor); 
    bufferAShader.setUniform('expandFactor', params.expandFactor); 
    bufferAShader.setUniform('caIntensity', params.caIntensity); 
    bufferAShader.setUniform('blurIntensity', params.blurIntensity); 
    bufferAShader.setUniform('iFrame', frameCount); // Current frame count

    bufferAShader.setUniform('flicker', params.flicker); 
    bufferAShader.setUniform('frequency', params.frequency); 
    bufferAShader.setUniform('contrast1', params.contrast1); 
    bufferAShader.setUniform('contrast2', params.contrast2); 

    bufferA.shader(bufferAShader);
    bufferA.rect(0, 0, width, height);


    if (params.viewMode == "1") {
        image(noiseTextureA, -width / 2, -height / 4, width/2, height/2);
        image(bufferA, 0, -height / 4, width/2, height/2);
    } else {
        image(bufferA, -width / 2, -height / 2, width, height);
    }

    if (params.viewMode == "2") {
        push();
        // blendMode(SCREEN);
        tint(255, 50);
        image(noiseTextureA, -width / 2, -height / 2, width, height);
        pop();
    }


    // image(wordTexture, -width / 2, -height / 2, width, height);
}

function cacheInput() {

    if (params.typesettingImageIndex !== '') {

        const index = parseInt(params.typesettingImageIndex, 10);
        const img = uploadedImages[index].img;

        wordTexture.clear(); // Clear previous content
        wordTexture.image(img, 0, 0, wordTexture.width, wordTexture.height);
        
        // wordTexture.image(uploadedImg, -width / 2, -height / 2, width, height);

    } else {


        wordTexture.push();
        
            wordTexture.textAlign(params.textAlign === 'LEFT' ? LEFT : params.textAlign === 'CENTER' ? CENTER : RIGHT, CENTER);

            wordTexture.textFont(font);
            wordTexture.textSize(params.fontsize);
            wordTexture.fill(255);
            wordTexture.noStroke();
            wordTexture.background(0);
            wordTexture.translate(width * 0.5, height * 0.5 - 5);

            // wordTexture.textLeading(params.fontsize * params.lineSpacing); // Example default leading is 16
            // const processedText = params.word.replace(/<br>/gi, "\n");
            // wordTexture.text(processedText, params.textX, params.textY);

            const lines = params.text.split("\n");
            let currentY = params.fontsize/2 - height/2; // Start position for Y
            lines.forEach((line, index) => {
                wordTexture.text(line, params.textX, params.textY + currentY);
                currentY += params.fontsize * params.lineSpacing;
            });
            

        wordTexture.pop();


        // wordTexture.textAlign(CENTER, CENTER);
        // wordTexture.textFont(font);
        // wordTexture.textSize(params.fontsize);
        // wordTexture.fill(255);
        // wordTexture.noStroke();
        // wordTexture.background(0);

        // wordTexture.push();
        // wordTexture.translate(width * 0.5, height * 0.5 - 5);
        // wordTexture.text(params.word, 0, 0);
        // wordTexture.pop();

    }
    
}

function updateWord() {

    cacheInput();
    frameCount = 0;
}



function cacheMap() {

    if (params.noiseImageIndex !== '') {
        
        const index = parseInt(params.noiseImageIndex, 10);
        const img = uploadedImages[index].img;

        noiseTextureA.clear(); // Clear previous content
        noiseTextureA.image(img, 0, 0, noiseTextureA.width, noiseTextureA.height);

    } else {

        // Update Perlin Noise

        noiseShaderA.setUniform('uResolution', [width, height]);
        noiseShaderA.setUniform('time', millis() * 0.001);
        noiseShaderA.setUniform('noisetype', params.noiseType);
        noiseShaderA.setUniform('perlinseed', params.perlinseed);
        noiseShaderA.setUniform('perlinscale', params.perlinscale);
        noiseShaderA.setUniform('perlinspeed', params.perlinspeed);

        let mouseUniformValue = [mouseX / width + 0.5, (height - mouseY) / height + 0.5];
        noiseShaderA.setUniform('u_mouse', mouseUniformValue);
        // console.log(mouseUniformValue);

        noiseTextureA.shader(noiseShaderA);
        noiseTextureA.rect(0, 0, noiseTextureA.width, noiseTextureA.height);
    }
}

function updateNoiseType() {
    // Here, you might switch shaders or adjust the current shader's behavior based on the selected noise type.
    // For this example, let's just log the selection and you can extend it to modify shader behavior.
    console.log('Selected Noise Type:', params.noiseType);
    // Depending on implementation, you might want to regenerate your noise texture here.
    cacheMap();
}





let uploadedImages = []; // Array to store uploaded image objects and names

function handleImageUpload(files) {
    uploadedImages = []; // Clear the current images array
    params.typesettingImageIndex = '';
    params.noiseImageIndex = '';
    
    let imagesLoaded = 0; // Track how many images have been loaded
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            loadImage(imageData, (img) => {
                uploadedImages.push({
                    img: img, 
                    name: file.name // Store the file name along with the image
                }); 
                imagesLoaded++;
                if(imagesLoaded === files.length) {
                    // All images are loaded, now update the GUI
                    updateInputImageGUI();
                    updateMapImageGUI();
                    updateWord(); // or any function that triggers a redraw
                }
            });
        };
        reader.readAsDataURL(file);
    });
}












function updateInputImageGUI() {
    if (typesettingImageControl) {
        gui.__folders.Overwrite.remove(typesettingImageControl); // Remove the old control
    }
    
    // Generate options based on uploaded images
    const fileOptions = { 'None': '' };
    uploadedImages.forEach((item, index) => {
        fileOptions[item.name] = index.toString(); // Use file name as key
    });

    // Add new control with updated options
    typesettingImageControl = gui.__folders.Overwrite.add(params, 'typesettingImageIndex', fileOptions)
        .name('Overwrite Input')
        .onChange(() => {
            updateWord();
        });
}

function updateMapImageGUI() {
    if (noiseImageControl) {
        gui.__folders.Overwrite.remove(noiseImageControl); // Remove the old control
    }
    
    // Generate options based on uploaded images
    const fileOptions = { 'None': '' };
    uploadedImages.forEach((item, index) => {
        fileOptions[item.name] = index.toString(); // Use file name as key
    });

    // Add new control with updated options
    noiseImageControl = gui.__folders.Overwrite.add(params, 'noiseImageIndex', fileOptions)
        .name('Overwrite Map')
        .onChange(() => {
            cacheMap();
        });
}









// Function to apply a preset
function applyPreset(presetValues) {
    Object.assign(params, presetValues);
    
    for (let i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
    }
    for (let i in gui.__folders) {
        let folder = gui.__folders[i];
        folder.__controllers.forEach(controller => {
            controller.updateDisplay();
        });
    }
    
    // updateInputImageGUI(); // Example: if you have specific functions to update parts of the GUI
    // updateMapImageGUI(); // Another example
    updateWord(); // Apply the changes visually
    cacheMap();
}


function applyPresetRandom() {
    // Iterate over all controllers in the GUI
    for (let i in gui.__folders) {
        let folder = gui.__folders[i];
    
        folder.__controllers.forEach(controller => {
            let id = controller.property; // Get the parameter name

            // Check if the parameter exists in params_preset_random
            if (params_preset_random.hasOwnProperty(id)) {
                let value;

                if (id === "noiseType") {
                    // Special handling for noiseType due to it being a dropdown
                    const optionsKeys = Object.keys(noiseTypes);
                    const randomKey = optionsKeys[Math.floor(Math.random() * optionsKeys.length)];
                    value = noiseTypes[randomKey];
                    
                } else if (typeof controller.__min !== 'undefined' && typeof controller.__max !== 'undefined') {
                    // Handle range values
                    value = Math.random() * (controller.__max - controller.__min) + controller.__min;
                    
                    // Apply step if exists
                    if (typeof controller.__step !== 'undefined') {
                        value = Math.round(value / controller.__step) * controller.__step;
                    }
                } else if (controller.__options) {
                    // Handle options (for dropdowns)
                    const options = Object.keys(controller.__options);
                    value = controller.__options[options[Math.floor(Math.random() * options.length)]];
                } else if (typeof controller.initialValue === 'boolean') {
                    // Handle booleans
                    value = Math.random() > 0.5;
                }

                // Update the random preset and the parameter itself
                params_preset_random[id] = value;
            }
        });
    }

    applyPreset(params_preset_random);
}
