import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add basic lighting
const light = new THREE.AmbientLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);
scene.background = new THREE.Color(0x808080);
// Create a grid helper for the background (grid size, divisions, and colors)
const gridHelper = new THREE.GridHelper(100, 100, 0xffffff, 0x000000);
scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

// Optional: adjust control properties
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false; // Prevents the camera from panning up/down
controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation to 90 degrees

// Load the GLTF model
const loader = new GLTFLoader();
loader.load('./cad/powerplant/gltf/power-plant2.gltf', function (gltf) {
  const model = gltf.scene;
  scene.add(model);

  // Accessing each child element
  model.traverse(function (child) {
    if (child.isMesh) {
      console.log('Mesh found:', child.name, child);
    }
  });
}, undefined, function (error) {
  console.error('An error occurred loading the model:', error);
});

// Position the camera
camera.position.z = 5;

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
