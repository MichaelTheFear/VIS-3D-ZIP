import * as THREE from 'three';

const meshes = [];


function addMesh(mesh) {
  mesh.visible = false;
  meshes.push(mesh);
}

function calculateCameraDistance(mesh, margin = 1.2) {
    // Compute the bounding box of the mesh
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    
    // Get the size and center of the bounding box
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Calculate the max dimension and distance based on fixed FOV (75 degrees)
    const maxDimension = Math.max(size.x, size.y, size.z);

    // Adjust the distance with a margin of error (default is 1.2 times the calculated distance)
    const distance = ((maxDimension / 2) / Math.tan(THREE.MathUtils.degToRad(75) / 2) * margin) * 2;

    return { distance, center };
}



function getRandomCameraPosition(mesh) {
    // Get the distance and center of the mesh
    const { distance, center } = calculateCameraDistance(mesh);

    // Generate random spherical coordinates
    const theta = Math.random() * 2 * Math.PI; // Random angle around Y-axis (0 to 360 degrees)
    const phi = Math.random() * Math.PI; // Random angle from top to bottom (0 to 180 degrees)

    // Convert spherical coordinates to Cartesian coordinates
    const x = center.x + distance * Math.sin(phi) * Math.cos(theta);
    const y = center.y + distance * Math.sin(phi) * Math.sin(theta);
    const z = center.z + distance * Math.cos(phi);

    return { pos : new THREE.Vector3(x, y, z) , center } ;
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

    for(let i = meshes.length - 1; i >= 0; i--){
        mesh = meshes[i];
        mesh.visible = true;
        const [positions, center] = generateCameraPositionsAroundObject(mesh);
        console.log(positions);

        for(let j = 0; j < positions.length; j++){
            yield [mesh.name, positions[j], center];
        }
        console.log(mesh)
        if(mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material) => material.dispose());
            } else {
              mesh.material.dispose();
            }
          }
    }
}

const nextAction = nextGeneratorAction();

export {nextAction, addMesh }