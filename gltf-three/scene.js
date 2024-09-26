import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


camera.position.set(0, 0, 5);

// Add basic lighting
const light = new THREE.AmbientLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);
scene.background = new THREE.Color(0x808080);
// Create a grid helper for the background (grid size, divisions, and colors)
const gridHelper = new THREE.GridHelper(100, 100, 0xffffff, 0x000000);
scene.add(gridHelper);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

export {scene, camera, animate, renderer}