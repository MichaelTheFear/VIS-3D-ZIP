import * as THREE from 'three';
import {scene, animate, camera} from './scene.js';
import GUI from 'lil-gui';
import { nextAction, addMesh } from './meshManager.js';

THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false;
THREE.Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = false;

const materials = [
  new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Red
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Green
  new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Blue
  new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Yellow
  new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Magenta
  new THREE.MeshBasicMaterial({ color: 0x00ffff })  // Cyan
];


const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
mesh2.position.x = 2;

addMesh(mesh);
addMesh(mesh2);

scene.add(mesh);
scene.add(mesh2);


const gui = new GUI();
const cameraPositionFolder = gui.addFolder('Buttons');
// add a button that calls nextPosition

const nextPosition = () => {
  const [name, position, center] = nextAction.next().value;
  camera.position.copy(position);
  camera.lookAt(center);
}


cameraPositionFolder.add({ run: nextPosition }, 'run').name('Next Position');

animate();

