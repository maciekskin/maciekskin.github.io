// SCENE SETUP
// Create the main scene where all 3D objects will be rendered
const scene = new THREE.Scene();
// Set the background color of the scene to sky blue
scene.background = new THREE.Color(0x55CEFF);

// CAMERA SETUP
// Create a perspective camera to give depth to the scene
// Parameters:
// - Field of view (75 degrees)
// - Aspect ratio (will be set to match window)
// - Near clipping plane (0.1 units)
// - Far clipping plane (1000 units)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// RENDERER SETUP
// Create a WebGL renderer for high-performance 3D rendering
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Smooth edges with antialiasing
// Set the size of the renderer to match the window
renderer.setSize(window.innerWidth, window.innerHeight);
// Add the renderer's canvas to the document body
document.body.appendChild(renderer.domElement);

/**
  * Create the fishing net geometry
  * @returns {Object} An object containing the net group and its geometry
  */
function createFishingNet() {
    // Create a group to hold all the net lines
    const netGroup = new THREE.Group();
    
    // Create material for the net lines
    // White color, 40% opacity, with transparency enabled
    const linesMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        opacity: 0.4, 
        transparent: true 
    });

    // Net configuration
    const gridSize = 25; // Number of lines in the grid
    const spacing = 1.0;  // Space between lines

    // 2D array to store base coordinates of the net
    // This helps in creating a consistent coordinate system
    const netGeometry = [];

    // GENERATE BASE COORDINATES
    // Create a grid of base coordinates
    for (let i = 0; i < gridSize; i++) {
        const rowCoords = [];
        for (let j = 0; j < gridSize; j++) {
            // Calculate x and y positions centered around (0,0)
            const x = (j - gridSize/2) * spacing;
            const y = (i - gridSize/2) * spacing;
            rowCoords.push({ x, y, baseZ: 0 });
        }
        netGeometry.push(rowCoords);
    }

    // CREATE HORIZONTAL LINES
    for (let i = 0; i < gridSize; i++) {
        const points = [];
        for (let j = 0; j < gridSize; j++) {
            const coord = netGeometry[i][j];
            
            // Calculate Z depth with trigonometric functions
            // Creates a wave-like pattern
            const z = (
                Math.sin(j * 0.3 + i * 0.3) * 1 + 
                Math.cos((coord.x + coord.y) * 0.2) * 0.5
            );
            
            // Create 3D point with calculated coordinates
            points.push(new THREE.Vector3(coord.x, coord.y, z));
        }
        
        // Convert points to a geometry that can be rendered
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        // Create a line from the geometry
        const line = new THREE.Line(lineGeometry, linesMaterial);
        // Add line to the net group
        netGroup.add(line);
    }

    // CREATE VERTICAL LINES (similar to horizontal lines)
    for (let j = 0; j < gridSize; j++) {
        const points = [];
        for (let i = 0; i < gridSize; i++) {
            const coord = netGeometry[i][j];
            
            // Different trigonometric calculation for vertical lines
            const z = (
                Math.cos(j * 0.3 + i * 0.3) * 1 + 
                Math.sin((coord.x + coord.y) * 0.2) * 0.5
            );
            
            points.push(new THREE.Vector3(coord.x, coord.y, z));
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, linesMaterial);
        netGroup.add(line);
    }

    // Return the net group and its base geometry
    return { group: netGroup, geometry: netGeometry };
}

// CREATE THE NET
// Generate the fishing net and add it to the scene
const { group: fishingNet, geometry: netGeometry } = createFishingNet();
scene.add(fishingNet);

// CAMERA POSITIONING
// Position the camera to create an ocean-like perspective
// - First parameter (x): horizontal position (0 = center)
// - Second parameter (y): vertical position (lowered to -10)
// - Third parameter (z): depth (20 units away)
camera.position.set(0, 12, 5);
// Adjust camera to look at the center of the scene
camera.lookAt(0, 0, 0);

// ANIMATION VARIABLES
let time = 0; // Tracks elapsed time for animations

/**
  * Main animation loop
  * Responsible for updating and rendering the scene
  */
function animate() {
    // Request next animation frame (creates smooth animation)
    requestAnimationFrame(animate);

    // Increment time for animation
    time += Math.floor(Math.random() * 20) * 0.001;
    
    // ROTATION ANIMATION
    // Create a tilted, wave-like rotation
    // Base rotation is set to Math.PI/4 (45 degrees)
    // Added sine/cosine for subtle movement
    fishingNet.rotation.x = Math.PI / 4 + Math.sin(time) * 0.1;
    fishingNet.rotation.y = Math.cos(time) * 0.2;

    // UPDATE NET LINES
    // Modify each line's geometry to create wave effect
    fishingNet.children.forEach((line, index) => {
        // Get the current line's position data
        const positions = line.geometry.attributes.position.array;
        
        // Update Z coordinate for each point
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i+1];
            
            // Calculate z-position with time-based wave
            const z = (
                Math.sin(x * 0.3 + y * 0.3 + time) * 1 + 
                Math.cos((x + y) * 0.2) * 0.5
            );
            
            // Update the z-coordinate
            positions[i+2] = z;
        }
        
        // Tell Three.js that position data has changed
        line.geometry.attributes.position.needsUpdate = true;
    });

    // Render the scene with the current camera
    renderer.render(scene, camera);
}

// WINDOW RESIZE HANDLING
// Ensure the scene looks good on different screen sizes
window.addEventListener('resize', () => {
    // Get new window dimensions
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    
    // Update camera aspect ratio
    camera.aspect = newWidth / newHeight;
    // Update camera projection matrix
    camera.updateProjectionMatrix();
    
    // Resize renderer
    renderer.setSize(newWidth, newHeight);
});

// START ANIMATION
// Begin the animation loop
animate();
