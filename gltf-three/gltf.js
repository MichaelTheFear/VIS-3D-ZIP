import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { addMesh } from './meshManager.js';


let modelLoaded = false;

export async function waitForModelLoad() {
  // Function to wait for the CAD model to be fully loaded for problems with concurrency
  while (modelLoaded === false) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Check every 100ms
  }
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s more
  console.log('Model is fully loaded. Starting capture...');
}

export function LoadCad(scene){
    // Function to load the CAD model
    let counter = 0;
    const loader = new GLTFLoader();
    loader.load('./cad/planta/planta.glb', function (gltf) {
    const model = gltf.scene;
    scene.add(model);

    model.traverse(function (child) {
      if (child.isMesh) {
        child.material.color.set(0xffffff);
        addMesh(child);
        if(counter >= 66668) modelLoaded = true;
        if(counter % 1000 === 0) console.log(`Model loaded percentage: ${counter/66668*100}%`);
        counter++;
      }
    });
  }, () => modelLoaded=false, function (error) {
  });
}