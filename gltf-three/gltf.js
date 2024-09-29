import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { addMesh } from './meshManager.js';

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
      }
    });
  }, undefined, function (error) {
  });

}