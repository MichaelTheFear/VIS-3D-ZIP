import * as THREE from "three";

import { boxSize, distance, repeats, startsAt } from "./constants";

const meshes = []; // list of all the meshes in the scene

const meshCounting = {};

function addMesh(mesh) {
  // add a new mesh to the list but scaled and hiden
  mesh.visible = false;

  const boundingBox = new THREE.Box3().setFromObject(mesh);

  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);

  const scaleFactor = boxSize / maxDim;

  mesh.scale.set(scaleFactor, scaleFactor, scaleFactor); // scale the mesh by the maximum side of the box

  mesh.position.set(
    -center.x * scaleFactor,
    -center.y * scaleFactor,
    -center.z * scaleFactor
  );

  mesh.updateMatrix();
  mesh.updateMatrixWorld(true);

  mesh.matrixAutoUpdate = false;
  mesh.matrixWorldAutoUpdate = false; //optimization

  const meshType = mesh.name.replace(/_.*/, "");

  if (meshCounting[meshType]) {
    meshCounting[meshType] += 1;
  } else {
    meshCounting[meshType] = 1;
  }

  meshes.push(mesh);
}

function getCenter(mesh) {
  // get center of the mesh
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  return center;
}

function generateCameraPositionsAroundObject(mesh) {
  // generate camera positions around the object in all octants randomly

  const center = getCenter(mesh);
  const positions = [];

  const octants = [
    [1, 1, 1], // (+X, +Y, +Z)
    [-1, 1, 1], // (-X, +Y, +Z)
    [1, -1, 1], // (+X, -Y, +Z)
    [-1, -1, 1], // (-X, -Y, +Z)
    [1, 1, -1], // (+X, +Y, -Z)
    [-1, 1, -1], // (-X, +Y, -Z)
    [1, -1, -1], // (+X, -Y, -Z)
    [-1, -1, -1], // (-X, -Y, -Z)
  ];

  octants.forEach((octant) => {
    const theta = (Math.random() * Math.PI) / 2;
    const phi = (Math.random() * Math.PI) / 2;

    const x = center.x + octant[0] * distance * Math.sin(theta) * Math.cos(phi);
    const y = center.y + octant[1] * distance * Math.sin(theta) * Math.sin(phi);
    const z = center.z + octant[2] * distance * Math.cos(theta);

    positions.push(new THREE.Vector3(x, y, z));
  });

  return [positions, center];
}

function* nextGeneratorAction() {
  // generator of camera positions around the objects

  let mesh;
  const numberOfPhotosPerObj = repeats;

  for (let i = meshes.length - startsAt - 1; i >= 0; i--) {
    mesh = meshes[i];
    mesh.visible = true;

    for (let k = 0; k < numberOfPhotosPerObj; k++) {
      const [positions, center] = generateCameraPositionsAroundObject(mesh);
      for (let j = 0; j < positions.length; j++) {
        yield [`${mesh.name}_${k}_${j}`, positions[j], center];
      }
    }

    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material.dispose();
      }
    }

    mesh.visible = false;
  }
  yield [".", [], { x: 0, y: 0, z: 0 }];
}

const nextAction = nextGeneratorAction();

export { nextAction, addMesh, meshCounting };
