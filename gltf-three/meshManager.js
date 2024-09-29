import * as THREE from 'three';

const meshes = [];

//const aspectRatio = window.innerWidth / window.innerHeight;

function addMesh(mesh) {
  mesh.visible = false;
  meshes.push(mesh);
}

function scaleAndCenter(mesh) {
    // Compute the bounding box of the mesh
    const boundingBox = new THREE.Box3().setFromObject(mesh);

    // Get the size and center of the bounding box
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    const maxDim = Math.max(size.x,size.y,size.z);

    const scaleFactor = 100 / maxDim;

    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

    mesh.position.set(
        -center.x * scaleFactor,
        -center.y * scaleFactor,
        -center.z * scaleFactor
    );

    return center;
}



function getRandomCameraPosition(mesh) {
    const distance = 120;

    const center = scaleAndCenter(mesh);
    
    // Generate random spherical coordinates
    const theta = 2 * Math.PI; // Random angle around Y-axis (0 to 360 degrees)
    const phi = Math.PI; // Random angle from top to bottom (0 to 180 degrees)
    const radius = distance; // Use the distance as the radius
    
    // Convert spherical coordinates to Cartesian coordinates
    const x = center.x + radius * Math.sin(phi) * Math.cos(theta);
    const y = center.y + radius * Math.sin(phi) * Math.sin(theta);
    const z = center.z + radius * Math.cos(phi);

    return { pos: new THREE.Vector3(x, y, z), center };
}


function generateCameraPositionsAroundObject(mesh) {
    // Get the initial random camera position around the mesh
    const {pos , center} = getRandomCameraPosition(mesh);

    const initialPosition = pos;

    // Array to store the positions
    const positions = [];

    // Define the rotation axes
    const axes = [
        new THREE.Vector3(1, 0, 0), // X-axis
        new THREE.Vector3(0, 1, 0), // Y-axis
        new THREE.Vector3(0, 0, 1), // Z-axis
    ];

    // Generate the 90-degree rotations
    // Rotate around each axis in both directions (+/-)
    for (let i = 0; i < axes.length; i++) {
        const axis = axes[i];
        
        // +90 degrees rotation
        let position = initialPosition.clone().sub(center).applyAxisAngle(axis, Math.PI / 2).add(center);
        positions.push(position);

        // -90 degrees rotation
        position = initialPosition.clone().sub(center).applyAxisAngle(axis, -Math.PI / 2).add(center);
        positions.push(position);
    }

    return [positions, center];
}


function* nextGeneratorAction(){
    let mesh;
    const numberOfPhotosPerObj = 8;


    for(let i = meshes.length - 1; i >= 0; i--){
        mesh = meshes[i];
        mesh.visible = true;
        //const [positions, center] = generateCameraPositionsAroundObject(mesh);
        
        for(let k = 0; k < numberOfPhotosPerObj; k++){
            const [positions, center] = generateCameraPositionsAroundObject(mesh);
            for(let j = 0; j < positions.length; j++){
                yield [`${mesh.name}_${k}_${j}`, positions[j], center];
            }
        }
        
       yield [`${mesh.name}`, positions[0] , center];
       
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