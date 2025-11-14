import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Get the canvas element from the DOM
const canvas = document.querySelector('canvas');

// Renderer 
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene with a white background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xff3e00);

// Camera
const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(-3.5,-43, 2.8);

// OrbitControls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Add event listener to log camera position on mouse interaction
controls.addEventListener('change', () => {
  console.log('Camera position changed:', {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  });
});

// Ambient light
scene.add(new THREE.AmbientLight(0xffffff, 1));

// Load texture for the sphere
const textureLoader = new THREE.TextureLoader();
const tennisballTexture = textureLoader.load('/public/assets/imgs/Tennisball_texture.jpg');

// Orange sphere in the center
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 64, 64),
  new THREE.MeshBasicMaterial({ map: tennisballTexture })
);
sphere.position.set(0, 0, 5);
scene.add(sphere);

// Black vertical lines (thin boxes)
const lineCount = 40;
const lineWidth = 0.15;
const lineHeight = window.innerHeight;
const spacing = 0.5;
const startX = -((lineCount / 2) * spacing);
const startX_back = -2 * ((lineCount / 2) * spacing);

// front lines
for (let i = 0; i < lineCount; i++) {
  // Only draw lines on the right half of the sphere
  if (i >= lineCount / 2) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(lineWidth, lineHeight, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    line.position.x = startX + i * spacing;
    line.position.z = 10; // Slightly in front of the sphere
    scene.add(line);
  }
}

// back lines
for (let i = 0; i < lineCount; i++) {
  // Only draw lines on the right half of the sphere
  if (i >= lineCount / 2) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(lineWidth, lineHeight, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    line.position.x = startX_back + i * spacing;
    line.position.z = 0; 
    scene.add(line);
  }
}

// Camera positions array
const cameraPositions = [
  { x: -3.5, y: -43, z: 2.8 }, // tennis view 1
  { x: -223, y: 123, z: -127 }, // kite surf view 2
  { x: -2, y: -20, z: -231 }  // meditation view 3
];

let currentPositionIndex = 0;

// Create navigation buttons
function createNavigationButtons() {
  // Create navigation container
  const navContainer = document.createElement('div');
  navContainer.className = 'webxr-nav-container';

  // Position indicator
  const positionIndicator = document.createElement('div');
  positionIndicator.className = 'webxr-position-indicator';
  
  // Create position dots
  const dots = [];
  for (let i = 0; i < cameraPositions.length; i++) {
    const dot = document.createElement('div');
    dot.className = `webxr-position-dot ${i === currentPositionIndex ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      currentPositionIndex = i;
      animateCameraTo(cameraPositions[currentPositionIndex]);
      updatePositionIndicator();
    });
    dots.push(dot);
    positionIndicator.appendChild(dot);
  }

  // Left arrow button
  const leftButton = document.createElement('button');
  leftButton.className = `webxr-nav-button ${currentPositionIndex > 0 ? '' : 'disabled'}`;
  leftButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  `;
  
  // Right arrow button
  const rightButton = document.createElement('button');
  rightButton.className = `webxr-nav-button ${currentPositionIndex < cameraPositions.length - 1 ? '' : 'disabled'}`;
  rightButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  `;

  // Add position label
  const positionLabel = document.createElement('div');
  positionLabel.className = 'webxr-position-label';
  positionLabel.textContent = `View ${currentPositionIndex + 1}`;

  // Update position indicator function
  function updatePositionIndicator() {
    dots.forEach((dot, index) => {
      dot.className = `webxr-position-dot ${index === currentPositionIndex ? 'active' : ''}`;
    });
    
    // Update button states
    leftButton.className = `webxr-nav-button ${currentPositionIndex > 0 ? '' : 'disabled'}`;
    rightButton.className = `webxr-nav-button ${currentPositionIndex < cameraPositions.length - 1 ? '' : 'disabled'}`;
  }

  // Assemble the navigation
  navContainer.appendChild(leftButton);
  navContainer.appendChild(positionLabel);
  navContainer.appendChild(positionIndicator);
  navContainer.appendChild(rightButton);

  // Add click event listeners
  leftButton.addEventListener('click', () => {
    if (currentPositionIndex > 0) {
      currentPositionIndex--;
      animateCameraTo(cameraPositions[currentPositionIndex]);
      updatePositionIndicator();
      positionLabel.textContent = `Tennis View ${currentPositionIndex + 1}`;
    }
  });

  rightButton.addEventListener('click', () => {
    if (currentPositionIndex < cameraPositions.length - 1) {
      currentPositionIndex++;
      animateCameraTo(cameraPositions[currentPositionIndex]);
      updatePositionIndicator();
      positionLabel.textContent = `View ${currentPositionIndex + 1}`;
    }
  });

  // Add container to the page
  document.body.appendChild(navContainer);
}

// Smooth camera animation function
function animateCameraTo(targetPosition) {
  const startPosition = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  };
  
  console.log('Camera animation started:');
  console.log('From position:', startPosition);
  console.log('To position:', targetPosition);
  
  const duration = 1000; // 1 second animation
  const startTime = Date.now();
  
  function updateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth easing function
    const easeProgress = progress * progress * (3 - 2 * progress);
    
    camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
    camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeProgress;
    camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;
    
    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    } else {
      // Log final camera position when animation completes
      console.log('Camera animation completed. Final position:', {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      });
    }
  }
  
  updateCamera();
}

// Initialize navigation buttons
createNavigationButtons();


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  // Uncomment the line below to continuously log camera position (warning: creates console spam)
  // console.log('Current camera position:', { x: camera.position.x, y: camera.position.y, z: camera.position.z });
  
  renderer.render(scene, camera);
}
animate();