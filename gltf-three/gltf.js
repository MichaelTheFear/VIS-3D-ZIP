import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';


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

camera.position.set(0, 0, 5);

const gui = new GUI();
const cameraPositionFolder = gui.addFolder('Camera');
cameraPositionFolder.add(camera.position, 'x').name('Position X');
cameraPositionFolder.add(camera.position, 'y').name('Position Y');
cameraPositionFolder.add(camera.position, 'z').name('Position Z');
cameraPositionFolder.open();

// Add lil-gui controls for the camera rotation (in radians)
const cameraRotationFolder = gui.addFolder('Camera Rotation');
cameraRotationFolder.add(camera.rotation, 'x', -Math.PI, Math.PI).name('Rotation X');
cameraRotationFolder.add(camera.rotation, 'y', -Math.PI, Math.PI).name('Rotation Y');
cameraRotationFolder.add(camera.rotation, 'z', -Math.PI, Math.PI).name('Rotation Z');
cameraRotationFolder.open();

const meshes = [];
// Load the GLTF model
const loader = new GLTFLoader();
loader.load('./cad/planta/planta.glb', function (gltf) {
  const model = gltf.scene;
  scene.add(model);

  // Accessing each child element
  model.traverse(function (child) {
    if (child.isMesh) {
      meshes.push(child);
    }
  });

  console.log(model)
  console.log("number of meshes", model.children.length);

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



/* 
O QUE EU PRECISO:

- Botão de proximo modelo
- Um que mostre qual o "nome" do modelo atual
- Um de status para ver se ainda existe algo no modelo



*/