import * as THREE from 'three';
import { scene, camera } from './scene.js';
import { nextAction } from './meshManager.js';
import { LoadCad, waitForModelLoad } from './gltf.js';
import { captureBatchOfPhotos } from './photographer.js';
import { width, height } from './constants';

const renderer = new THREE.WebGLRenderer({ antialias: true });
const renderTarget = new THREE.WebGLRenderTarget(width, height, {
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType,
});
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(121, 0, 0);
renderer.setSize(width, height);
scene.add(directionalLight);
document.body.appendChild(renderer.domElement);

/*
//BOX TEST

const boxSize = 75;

const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

boxMesh.position.set(0, 0, 0);

scene.add(boxMesh);


function animate() {

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();
*/

LoadCad(scene);

function nextPhoto() {
  const [name, position, center] = nextAction.next().value;
  camera.position.copy(position);
  camera.lookAt(center);
  directionalLight.position.copy(position);
  return name;
}

function capturePhoto(pixels) {
  renderer.render(scene, camera);
  renderer.setRenderTarget(renderTarget);
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels);
}

function start() {
  waitForModelLoad().then(() => {
    captureBatchOfPhotos(nextPhoto, capturePhoto);
  });
}

start();
