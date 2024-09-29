

import * as THREE from 'three';
import {scene, camera} from './scene.js';
import GUI from 'lil-gui';
import { nextAction, addMesh } from './meshManager.js';
import { LoadCad } from './gltf.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

LoadCad(scene);


const params = {
  message: "---"
}


const gui = new GUI();
const message = gui.add(params, 'message').name('File Name');
// add a button that calls nextPosition
const nextPhoto = () => {
  const [name, position, center] = nextAction.next().value;
  params.message = name;
  message.updateDisplay();
  camera.position.copy(position);
  camera.lookAt(center);
}


gui.add({ run: nextPhoto }, 'run').name('Next Photo');

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate(scene, camera);




