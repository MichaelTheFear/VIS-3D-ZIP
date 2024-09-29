import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
//const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;
//controls.dampingFactor = 0.25;

camera.position.set(0, 0, 120);

// Add basic lighting
const light = new THREE.AmbientLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);
scene.background = new THREE.Color(0x008080);


//THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false;
//THREE.Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = false;


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

export {scene, camera, animate, renderer}