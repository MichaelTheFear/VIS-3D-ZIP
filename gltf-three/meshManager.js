import * as THREE from "three";

import { boxSize, distance, repeats, startsAt } from "./constants";

const meshes = []; // list of all the meshes in the scene

const meshCounting = {};

const meshesIndexes = {};

const test = [];
const validation = [];
const train = [];

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
    meshesIndexes[meshType].push(meshes.length);
  } else {
    meshCounting[meshType] = 1;
    meshesIndexes[meshType] = [meshes.length];
    console.log(meshType);
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

  const octant = octants[Math.floor(Math.random() * octants.length)];
  const theta = (Math.random() * Math.PI) / 2;
  const phi = (Math.random() * Math.PI) / 2;

  const x = center.x + octant[0] * distance * Math.sin(theta) * Math.cos(phi);
  const y = center.y + octant[1] * distance * Math.sin(theta) * Math.sin(phi);
  const z = center.z + octant[2] * distance * Math.cos(theta);

  const position = new THREE.Vector3(x, y, z);

  return [position, center];
}


function generateNumberOfRepeats(maxSize, numberOfObjects) {
  const numberOfRepeatsPerObj = {};
  for (let i = 0; i < numberOfObjects; i++) {
    const obj = Object.keys(meshCounting)[i];
    numberOfRepeatsPerObj[obj] = Math.floor(maxSize / meshCounting[obj] || 1); // Prevent division by zero
  }

  return Object.values(numberOfRepeatsPerObj);
}

/*

export function generateMeshOrder() {
  const max = (a, b) => Math.max(a, b);
  const maxSize = repeats * Object.values(meshCounting).reduce(max, 0);

  const numberOfObjects = Object.keys(meshCounting).length;
  const totalSize = maxSize * numberOfObjects;

  const trainSize = Math.floor(totalSize * 0.6);
  const validationSize = Math.floor(totalSize * 0.2);
  const testSize = Math.floor(totalSize * 0.2);

  const meshesArrays = Object.values(meshesIndexes);
  const repeatsPerObj = generateNumberOfRepeats(maxSize, numberOfObjects);

  console.log("Sizes", maxSize, trainSize, validationSize, testSize);
  let j = 0;
  let i = 0;
  const addToArray = (size, targetArray) => {
    const totalSize = i + size;
    for (; i < totalSize; i++) {
      if (numberOfObjects <= j) j = 0;
      const arrayIndex = Math.min(
        Math.floor(repeatsPerObj[j] / Math.max(1, i + 1)),
        meshesArrays[j].length - 1
      ); // Prevent out-of-bounds access
      targetArray.push(meshesArrays[j][arrayIndex]);
      j++;
    }
  };

  addToArray(testSize, test);
  addToArray(validationSize, validation);
  addToArray(trainSize, train);
}

*/

export function generateMeshOrder() {

  const totalSize = Object.values(meshCounting).reduce((acc,cur) => acc+cur, 0);

  const trainSize = Math.floor(totalSize * 0.6);
  const validationSize = Math.floor(totalSize * 0.2);
  const testSize = Math.floor(totalSize * 0.2);

  const meshesArrays = Object.values(meshesIndexes);

  //console.log("Sizes", maxSize, trainSize, validationSize, testSize);
  let porcentage = 0;
  
  const addToArray = (size, targetArray) => {
    for(let meshesArr of meshesArrays){
      let startingPoint = meshesArr.length*porcentage;
      for(let i = startingPoint; i<startingPoint+size;i++){
        targetArray.push(meshesArr[i])
      }
    }
    porcentage = size;
  };

  for(let k = 0 ; k<repeats; k++){
    porcentage = 0;
    addToArray(testSize, test);
    addToArray(validationSize, validation);
    addToArray(trainSize, train);
  }
}

function* nextGeneratorAction() {
  const processArray = function* (array, label) {
    for (let i = 0; i < array.length; i++) {
      const index = array[i];
      const mesh = meshes[index];
      if (!mesh) {
        console.warn(`Mesh at index ${index} is undefined.`);
        continue;
      }

      mesh.visible = true;

      const [positions, center] = generateCameraPositionsAroundObject(mesh);
      yield [`${mesh.name}`, positions, center, label];

      mesh.visible = false;
    }
  };

  yield* processArray(test, "test");
  yield* processArray(validation, "val");
  yield* processArray(train, "train");
  yield [".", [], { x: 0, y: 0, z: 0 }];
}

const nextAction = nextGeneratorAction();

export { nextAction, addMesh, meshCounting };
