/**
 * 3D Gallery - Long corridor with one-point perspective and framed artworks.
 * Uses global THREE (loaded via script tag) so it works with file:// and any server.
 */

(function () {
  const THREE = window.THREE;
  if (!THREE) {
    showError('Three.js failed to load. Check the console or try a local server (e.g. npx serve).');
    return;
  }

  const CORRIDOR_LENGTH = 28;
  const CORRIDOR_WIDTH = 6;
  const CORRIDOR_HEIGHT = 4;

  function getAssetBase() {
    try {
      let base = new URL('..', window.location.href).href;
      if (!base.endsWith('/')) base += '/';
      return base;
    } catch (e) {
      return window.location.origin + '/';
    }
  }

  function createCorridor(scene) {
    const darkWall = new THREE.MeshStandardMaterial({
      color: 0x1a1f1c,
      roughness: 0.95,
      metalness: 0.05,
    });
    const darkFloor = new THREE.MeshStandardMaterial({
      color: 0x252a26,
      roughness: 0.9,
      metalness: 0.0,
    });
    const darkCeiling = new THREE.MeshStandardMaterial({
      color: 0x151a17,
      roughness: 0.95,
      metalness: 0.05,
    });

    const halfW = CORRIDOR_WIDTH / 2;
    const halfH = CORRIDOR_HEIGHT / 2;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_LENGTH),
      darkFloor
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -halfH;
    floor.position.z = -CORRIDOR_LENGTH / 2;
    scene.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_LENGTH),
      darkCeiling
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = halfH;
    ceiling.position.z = -CORRIDOR_LENGTH / 2;
    scene.add(ceiling);

    const wallGeo = new THREE.PlaneGeometry(CORRIDOR_LENGTH, CORRIDOR_HEIGHT);
    const leftWallMesh = new THREE.Mesh(wallGeo, darkWall);
    leftWallMesh.rotation.y = Math.PI / 2;
    leftWallMesh.position.set(-halfW, 0, -CORRIDOR_LENGTH / 2);
    scene.add(leftWallMesh);

    const rightWallMesh = new THREE.Mesh(wallGeo.clone(), darkWall);
    rightWallMesh.rotation.y = -Math.PI / 2;
    rightWallMesh.position.set(halfW, 0, -CORRIDOR_LENGTH / 2);
    scene.add(rightWallMesh);

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_HEIGHT),
      new THREE.MeshStandardMaterial({ color: 0x0a0c0a, roughness: 1, metalness: 0 })
    );
    backWall.position.set(0, 0, -CORRIDOR_LENGTH);
    scene.add(backWall);
  }

  function createFrame(scene, opts) {
    const { z, width, height, imageUrl, frameColor, side, y = 0 } = opts;
    const loader = new THREE.TextureLoader();
    const border = 0.08;

    const frameGroup = new THREE.Group();
    const offset = 0.02;
    if (side === 'left') {
      frameGroup.position.set(-CORRIDOR_WIDTH / 2 + offset, y, -z);
      frameGroup.rotation.y = Math.PI / 2;
    } else {
      frameGroup.position.set(CORRIDOR_WIDTH / 2 - offset, y, -z);
      frameGroup.rotation.y = -Math.PI / 2;
    }

    const frameBack = new THREE.Mesh(
      new THREE.PlaneGeometry(width + border * 2, height + border * 2),
      new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.6, metalness: 0.2 })
    );
    frameBack.position.z = -0.02;
    frameGroup.add(frameBack);

    loader.load(
      imageUrl,
      (tex) => {
        if (tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          side: THREE.DoubleSide,
        });
        const canvas = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
        canvas.position.z = 0.01;
        frameGroup.add(canvas);
      },
      undefined,
      () => {}
    );

    scene.add(frameGroup);
  }

  function addFrames(scene) {
    const base = getAssetBase();
    const frames = [
      { imageUrl: base + 'assets/draws/Untitled_Artwork 1.jpg', z: 3, width: 1.4, height: 1.8, frameColor: 0xc9a227, side: 'left', y: 0.2 },
      { imageUrl: base + 'assets/draws/Untitled_Artwork 2.jpg', z: 6, width: 1.2, height: 1.0, frameColor: 0x2d5a27, side: 'right', y: -0.3 },
      { imageUrl: base + 'assets/draws/Untitled_Artwork 3.jpg', z: 9, width: 1.0, height: 1.2, frameColor: 0x1a4a6e, side: 'left', y: -0.2 },
      { imageUrl: base + 'assets/images/self/self0.PNG', z: 12, width: 1.1, height: 1.4, frameColor: 0x8b4560, side: 'right', y: 0.1 },
      { imageUrl: base + 'assets/images/self/self1.png', z: 15, width: 0.9, height: 1.1, frameColor: 0xe8c547, side: 'left', y: -0.4 },
      { imageUrl: base + 'assets/images/pebble.jpg', z: 18, width: 1.0, height: 0.8, frameColor: 0x4a4a4a, side: 'right', y: 0 },
      { imageUrl: base + 'assets/images/brick.jpg', z: 21, width: 1.2, height: 0.9, frameColor: 0x3a2a1a, side: 'left', y: 0.2 },
      { imageUrl: base + 'assets/images/self/self2.png', z: 24, width: 0.7, height: 0.9, frameColor: 0x2a4a6a, side: 'right', y: -0.3 },
    ];

    frames.forEach((f) => createFrame(scene, f));
  }

  function showError(msg) {
    hideLoading();
    const el = document.getElementById('galleryError');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
    console.error('[Gallery]', msg);
  }

  function hideLoading() {
    const el = document.getElementById('galleryLoading');
    if (el) el.style.display = 'none';
  }

  function init() {
    const container = document.getElementById('gallery-canvas');
    if (!container) {
      showError('Container #gallery-canvas not found.');
      return;
    }

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0c);
      scene.fog = new THREE.FogExp2(0x0a0a0c, 0.028);

      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 4);
      camera.lookAt(0, 0, -CORRIDOR_LENGTH / 2);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      if (renderer.toneMapping !== undefined) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.6;
      }
      container.appendChild(renderer.domElement);
      renderer.domElement.tabIndex = 0;
      renderer.domElement.focus();

      const ambient = new THREE.AmbientLight(0x2a2a2e, 0.5);
      scene.add(ambient);
      const mainLight = new THREE.DirectionalLight(0xe8e4dc, 0.5);
      mainLight.position.set(2, 3, 5);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      scene.add(mainLight);
      const fill = new THREE.DirectionalLight(0x6a6a7a, 0.15);
      fill.position.set(-2, 1, 3);
      scene.add(fill);

      createCorridor(scene);
      addFrames(scene);

      // Simple orbit: drag to rotate, scroll to dolly
      const target = new THREE.Vector3(0, 0, -CORRIDOR_LENGTH / 2);
      let azimuth = 0;
      let elevation = 0.1;
      let distance = 4;
      let isDown = false;
      let prevX = 0;
      let prevY = 0;

      function updateCamera() {
        distance = Math.max(2, Math.min(18, distance));
        elevation = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, elevation));
        const x = distance * Math.cos(elevation) * Math.sin(azimuth);
        const z = -distance * Math.cos(elevation) * Math.cos(azimuth);
        const y = distance * Math.sin(elevation);
        camera.position.set(target.x + x, target.y + y, target.z + z);
        camera.lookAt(target);
      }

      renderer.domElement.addEventListener('mousedown', (e) => {
        if (e.button === 0) { isDown = true; prevX = e.clientX; prevY = e.clientY; }
      });
      renderer.domElement.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        azimuth -= (e.clientX - prevX) * 0.005;
        elevation += (e.clientY - prevY) * 0.005;
        prevX = e.clientX;
        prevY = e.clientY;
        updateCamera();
      });
      renderer.domElement.addEventListener('mouseup', () => { isDown = false; });
      renderer.domElement.addEventListener('mouseleave', () => { isDown = false; });
      renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        distance += e.deltaY * 0.01;
        updateCamera();
      }, { passive: false });

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      hideLoading();
      const hint = document.getElementById('galleryHint');
      if (hint) setTimeout(() => hint.classList.add('fade-out'), 500);

      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();
    } catch (err) {
      showError('Gallery failed to start: ' + (err.message || err));
      console.error(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
