import * as THREE from 'three';

import { boxSize, distance, repeats, startsAt } from './constants';

const meshes = [];

function addMesh(mesh) {
  mesh.visible = false;

  const boundingBox = new THREE.Box3().setFromObject(mesh);

  // Get the size and center of the bounding box
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  const maxDim = Math.max(size.x,size.y,size.z);

  const scaleFactor = boxSize / maxDim;

  mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

  mesh.position.set(
      -center.x * scaleFactor,
      -center.y * scaleFactor,
      -center.z * scaleFactor
    );

  mesh.updateMatrix();
  mesh.updateMatrixWorld(true);

  mesh.matrixAutoUpdate = false;
  mesh.matrixWorldAutoUpdate = false;

  meshes.push(mesh);
}

function getCenter(mesh) {

    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    return center;
}



function getRandomCameraPosition(mesh) {
  const center = getCenter(mesh); // Get the center of the mesh

  // Array of 8 octants in 3D space (combining signs for X, Y, Z)
  const octants = [
      [1, 1, 1],    // Octant 1 (+X, +Y, +Z)
      [-1, 1, 1],   // Octant 2 (-X, +Y, +Z)
      [1, -1, 1],   // Octant 3 (+X, -Y, +Z)
      [-1, -1, 1],  // Octant 4 (-X, -Y, +Z)
      [1, 1, -1],   // Octant 5 (+X, +Y, -Z)
      [-1, 1, -1],  // Octant 6 (-X, +Y, -Z)
      [1, -1, -1],  // Octant 7 (+X, -Y, -Z)
      [-1, -1, -1], // Octant 8 (-X, -Y, -Z)
  ];

  // Pick a random octant
  const randomOctant = octants[Math.floor(Math.random() * octants.length)];
  
  // Calculate the random camera position in that octant
  const x = center.x + randomOctant[0] * distance;
  const y = center.y + randomOctant[1] * distance;
  const z = center.z + randomOctant[2] * distance;

  return { pos: new THREE.Vector3(x, y, z), center };
}


function generateCameraPositionsAroundObject(mesh) {
  const center = getCenter(mesh);

  // Array to store the camera positions
  const positions = [];

  // Array of 8 octants in 3D space (each octant has a combination of signs for X, Y, Z)
  const octants = [
      [1, 1, 1],    // Octant 1 (+X, +Y, +Z)
      [-1, 1, 1],   // Octant 2 (-X, +Y, +Z)
      [1, -1, 1],   // Octant 3 (+X, -Y, +Z)
      [-1, -1, 1],  // Octant 4 (-X, -Y, +Z)
      [1, 1, -1],   // Octant 5 (+X, +Y, -Z)
      [-1, 1, -1],  // Octant 6 (-X, +Y, -Z)
      [1, -1, -1],  // Octant 7 (+X, -Y, -Z)
      [-1, -1, -1], // Octant 8 (-X, -Y, -Z)
  ];

  // Loop through each octant and calculate the camera position
  octants.forEach((octant) => {
      const x = center.x + octant[0] * distance;
      const y = center.y + octant[1] * distance;
      const z = center.z + octant[2] * distance;
      
      positions.push(new THREE.Vector3(x, y, z));
  });

  return [positions, center];
}



function* nextGeneratorAction(){
    let mesh;
    const numberOfPhotosPerObj = repeats;


    for(let i = meshes.length - startsAt - 1; i >= 0; i--){
        mesh = meshes[i];
        mesh.visible = true;

        for(let k = 0; k < (numberOfPhotosPerObj); k++){
            const [positions, center] = generateCameraPositionsAroundObject(mesh);
            for(let j = 0; j < positions.length; j++){
                yield [`${mesh.name}_${k}_${j}`, positions[j], center];
            }
        }
        
       
        if(mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material) => material.dispose());
            } else {
              mesh.material.dispose();
            }
          }

          
        mesh.visible = false;
    }
    yield [".", [], {x: 0, y: 0, z: 0}];
}

const nextAction = nextGeneratorAction();

export {nextAction, addMesh }