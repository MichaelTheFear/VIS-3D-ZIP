import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

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

export {scene, camera}