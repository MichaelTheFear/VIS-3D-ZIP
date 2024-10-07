import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { addMesh } from './meshManager.js';

let modelLoaded = 0;

export async function waitForModelLoad() {
  while (modelLoaded < 66668 ) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Check every 100ms
  }
  console.log('Model is fully loaded. Starting capture...');
}

export function LoadCad(scene){

    const loader = new GLTFLoader();
    loader.load('./cad/planta/planta.glb', function (gltf) {
    const model = gltf.scene;
    scene.add(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        //change the color to white
        child.material.color.set(0xffffff);
        addMesh(child);
        modelLoaded++;
      }
    });
  }, undefined, function (error) {
  });
}