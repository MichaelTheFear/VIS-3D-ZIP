import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { boxSize as scaleFactor, width, height, distance } from "./constants";
import { scene, camera } from "./scene";
import { generateCameraPositionsAroundObject } from "./meshManager";
import numeric from "numeric";
import axios from "axios";

const classificationResults = {};

const renderer = new THREE.WebGLRenderer({ antialias: true });
const renderTarget = new THREE.WebGLRenderTarget(width, height, {
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType,
});
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 0, 120);
renderer.setSize(width, height);
scene.add(directionalLight);
document.body.appendChild(renderer.domElement);



async function apiCall(parameters,endpoint){
  const response = await axios.get(endpoint);
  return response;
}

let unmatchesOfVertices = 0;
function calculateLeastSquaresError(object1, object2) {
  const vertices1 = object1.geometry.attributes.position.array;
  const vertices2 = object2.geometry.attributes.position.array;

  
  if (vertices1.length !== vertices2.length) {
    unmatchesOfVertices = unmatchesOfVertices + 1;
    throw new Error(
      "Objects must have the same number of vertices for error calculation."
    );
  }

  let error = 0;
  for (let i = 0; i < vertices1.length; i += 3) {
    const dx = vertices1[i] - vertices2[i];
    const dy = vertices1[i + 1] - vertices2[i + 1];
    const dz = vertices1[i + 2] - vertices2[i + 2];
    error += dx * dx + dy * dy + dz * dz;
  }

  return error;
}

// Function that calculate the following equation G1 * MT = G2
function calculateLinearTransformation(object1, object2) {
  const vertices1 = object1.geometry.attributes.position.array;
  const vertices2 = object2.geometry.attributes.position.array;

  if (vertices1.length !== vertices2.length) {
    throw new Error(
      "Objects must have the same number of vertices for transformation calculation."
    );
  }

  
}

// Function: Apply transformation to an object
function applyTransformation(object, transformation) {
  const { rotation, scale, translation } = transformation;

  const vertices = object.geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = new THREE.Vector3(
      vertices[i],
      vertices[i + 1],
      vertices[i + 2]
    );
    vertex.applyMatrix3(rotation).multiplyScalar(scale);
    vertices[i] = vertex.x;
    vertices[i + 1] = vertex.y;
    vertices[i + 2] = vertex.z;
  }
  object.geometry.attributes.position.needsUpdate = true;
  object.position.add(translation);
}

// Function: Save canonical objects to GLTF
async function saveCanonicalObjects(classificationResults, outputFilename) {
  const exportScene = new THREE.Scene();

  for (const className in classificationResults) {
    const objects = classificationResults[className];
    if (objects.length === 0) continue;

    // Use the first object of each class as the canonical object
    const referenceObject = objects[0].clone();
    exportScene.add(referenceObject);
  }

  const exporter = new GLTFExporter();
  exporter.parse(
    exportScene,
    (result) => {
      const blob = new Blob([result], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = outputFilename || "canonical_objects.gltf";
      link.click();
    },
    { binary: true }
  );
}

const loader = new GLTFLoader();
loader.load("./cad/planta/planta.glb", async (gltf) => {
  const root = gltf.scene;

  // Initially set all meshes to invisible
  root.traverse((child) => {
    if (child.isMesh) {
      child.visible = false;
    }
  });

  root.traverse(async (child) => {
    if (child.isMesh) {
      // Save original properties
      const originalScale = child.scale.clone();
      const originalMaterial = child.material.clone();
      const originalMetalness = child.material.metalness;
      const originalRoughness = child.material.roughness;

      // Apply white material with predefined metalness and roughness
      child.material.color.set(0xffffff);
      child.material.metalness = 0.2;
      child.material.roughness = 0.6;

      // Scale the mesh
      child.scale.multiplyScalar(scaleFactor);

      // Set this mesh to visible
      child.visible = true;

      // Position the camera
      const [cameraPosition, lookAtPosition] =
        generateCameraPositionsAroundObject(child);
      camera.position.copy(cameraPosition);
      camera.lookAt(lookAtPosition);

      // Render to a render target
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      // Read pixels from the render target
      const pixels = new Uint8Array(224 * 224 * 4);
      renderer.readRenderTargetPixels(renderTarget, 0, 0, 224, 224, pixels);

      // Convert to grayscale
      const grayscalePixels = new Float32Array(224 * 224);
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        grayscalePixels[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
      }

      // Fake backend classification
      const className = child.name.replace(/(_.*)/, "");
      //const predName = apiCall("http://localhost:8000/api",grayscalePixels);

      // Add the mesh to the classification dictionary
      if (!classificationResults[className]) {
        classificationResults[className] = [];
      }
      classificationResults[className].push(child);
      try {
        if (classificationResults[className].length > 1) {
          const referenceObject = classificationResults[className][0]; // Use the first object as the reference
          //calculateLinearTransformation(referenceObject,child);
          /*
          const transformation = calculateLinearTransformation(
            referenceObject,
            child
          );

          // Apply transformation to a copy of the reference object
          const transformedObject = referenceObject.clone();
          applyTransformation(transformedObject, transformation);
          */
          // Calculate and print the error
          const error = calculateLeastSquaresError(referenceObject, child);
          console.log(
            `Class: ${className}, Object: ${child.name}, Error: ${error}`
          );
        }
      } catch (e) {
        if (e.message.includes("must have the same number of vertices")) {
          // Increment mismatch count for the class
          console.warn(
            `Vertex mismatch for class '${className}', Object: ${child.name}`
          );
        } else {
          console.error(e); // Log other unexpected errors
        }
      }

      // Restore original properties
      child.material = originalMaterial;
      child.scale.copy(originalScale);
      child.material.metalness = originalMetalness;
      child.material.roughness = originalRoughness;

      // Set the mesh back to invisible
      child.visible = false;
    }
  });

  // After processing, set all meshes back to visible
  root.traverse((child) => {
    if (child.isMesh) {
      child.visible = true;
    }
  });
  console.log("Impossible by least squares", unmatchesOfVertices/66669);
  scene.add(root);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
