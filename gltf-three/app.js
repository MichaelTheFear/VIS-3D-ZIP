import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add basic lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

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
