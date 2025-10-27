import * as THREE from 'https://threejs.org/build/three.module.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lumière
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Sol (ground)
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22, side: THREE.DoubleSide }); // Vert comme herbe
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Ciel simple (skybox basique)
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Collines placeholders (comme dans l'univers Mario)
for (let i = 0; i < 5; i++) {
    const hillGeometry = new THREE.SphereGeometry(3 + Math.random() * 2, 32, 32);
    const hillMaterial = new THREE.MeshBasicMaterial({ color: 0x556B2F });
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    hill.position.set(Math.random() * 50 - 25, 0, Math.random() * 50 - 50);
    scene.add(hill);
}

// Loader GLTF
const loader = new GLTFLoader();
let mario;
let castle;

// Charger Mario (ou placeholder si pas de modèle)
loader.load('mario.gltf', (gltf) => {
    mario = gltf.scene;
    mario.scale.set(0.5, 0.5, 0.5); // Ajuste la taille si besoin
    scene.add(mario);
}, undefined, () => {
    // Placeholder si erreur : boîte rouge pour Mario
    const marioGeometry = new THREE.BoxGeometry(1, 2, 1);
    const marioMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    mario = new THREE.Mesh(marioGeometry, marioMaterial);
    mario.position.y = 1;
    scene.add(mario);
});

// Charger Château (ou placeholder)
loader.load('castle.gltf', (gltf) => {
    castle = gltf.scene;
    castle.position.set(0, 0, -20); // Derrière Mario
    castle.scale.set(2, 2, 2); // Ajuste la taille
    scene.add(castle);
}, undefined, () => {
    // Placeholder : boîte grise pour château
    const castleGeometry = new THREE.BoxGeometry(5, 5, 5);
    const castleMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    castle = new THREE.Mesh(castleGeometry, castleMaterial);
    castle.position.set(0, 2.5, -20);
    scene.add(castle);
});

// Position caméra initiale (derrière Mario, château en fond)
camera.position.set(0, 3, 10);
camera.lookAt(0, 0, 0);

// Contrôles
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

let cameraAngle = 0; // Angle pour rotation caméra
let velocityY = 0; // Pour saut
const gravity = -0.05;
const jumpForce = 1.5;
let marioY = 0; // Position Y de Mario (pour placeholders ou modèles)

function animate() {
    requestAnimationFrame(animate);

    // Saut avec A (si Mario chargé)
    if (mario) {
        if (keys['a'] && mario.position.y <= 0) {
            velocityY = jumpForce;
        }
        velocityY += gravity;
        mario.position.y += velocityY;
        if (mario.position.y < 0) {
            mario.position.y = 0;
            velocityY = 0;
        }
    }

    // Rotation caméra avec flèches gauche/droite
    if (keys['arrowleft']) {
        cameraAngle += 0.03;
    }
    if (keys['arrowright']) {
        cameraAngle -= 0.03;
    }

    // Position caméra en orbite autour de Mario
    camera.position.x = 0 + 10 * Math.sin(cameraAngle);
    camera.position.z = 0 + 10 * Math.cos(cameraAngle);
    camera.position.y = 3 + mario?.position.y || 3; // Suit le saut
    camera.lookAt(0, mario?.position.y || 0, 0);

    renderer.render(scene, camera);
}

animate();

// Resize fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
