// Create scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black space background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 50;
controls.minDistance = 2;
controls.autoRotate = true;
controls.autoRotateSpeed = -0.5;
controls.rotateSpeed = -1;

// Lighting - dim for space
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Starfield
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 0.3 });
const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Shooting stars
const shootingStars = [];
const shootingStarMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
for (let i = 0; i < 5; i++) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const star = new THREE.Points(geometry, shootingStarMaterial);
    star.position.set((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000);
    star.velocity = new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
    scene.add(star);
    shootingStars.push(star);
}

// Function to create text texture
const createTextTexture = (letter) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    // Solid matcha green background
    ctx.fillStyle = '#8BAE66'; // Specified hex
    ctx.fillRect(0, 0, 512, 512);
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 256, 256);
    return new THREE.CanvasTexture(canvas);
};

// Paintings
const paintingGeometry = new THREE.BoxGeometry(10, 15, 1); // Add thickness
const frameGeometry = new THREE.PlaneGeometry(10.2, 15.2);
const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, side: THREE.DoubleSide });
const paintings = [
    'assets/animals.png',
    'assets/boots.png',
    'assets/dog.png',
    'assets/flowers.png',
    'assets/vase.png'
];

const loader = new THREE.TextureLoader();
const radius = 25;
const shreya = 'SHREYA';
paintings.forEach((url, index) => {
    loader.load(url, (texture) => {
        // Materials for box: front and back different
        const frontMaterial = new THREE.MeshLambertMaterial({ map: texture });
        const backMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Wooden brown, no text
        const sideMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Wooden brown
        const materials = [
            sideMaterial, // right
            sideMaterial, // left
            sideMaterial, // top
            sideMaterial, // bottom
            frontMaterial, // front
            backMaterial  // back
        ];
        
        const painting = new THREE.Mesh(paintingGeometry, materials);
        
        // Frame for front
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        
        const angle = (index / paintings.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        painting.position.set(x, 0, z);
        painting.lookAt(0, 0, 0);
        
        frame.position.set(x, 0, z - 0.1);
        frame.lookAt(0, 0, 0);
        
        scene.add(frame);
        scene.add(painting);
        
        // Spotlight on front
        const spotLight = new THREE.SpotLight(0xffffff, 8, 40, Math.PI / 6);
        spotLight.position.set(x, 10, z);
        spotLight.target = painting;
        scene.add(spotLight);
    });
});

// Camera position
camera.position.set(0, 0, 5);
controls.target.set(0, 0, 0);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    shootingStars.forEach(star => {
        star.position.add(star.velocity);
        if (star.position.length() > 1500) { // Reset if too far
            star.position.set((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000);
            star.velocity.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
        }
    });

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});