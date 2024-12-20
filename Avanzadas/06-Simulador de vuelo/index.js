// Implementación de Perlin Noise
class PerlinNoise {
    constructor() {
        this.permutation = new Array(256);
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
        }
        this.permutation = [...this.permutation, ...this.permutation];
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y, z = 0) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.permutation[X] + Y;
        const AA = this.permutation[A] + Z;
        const AB = this.permutation[A + 1] + Z;
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B] + Z;
        const BB = this.permutation[B + 1] + Z;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.permutation[AA], x, y, z),
                    this.grad(this.permutation[BA], x - 1, y, z)
                ),
                this.lerp(u,
                    this.grad(this.permutation[AB], x, y - 1, z),
                    this.grad(this.permutation[BB], x - 1, y - 1, z)
                )
            ),
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.permutation[AA + 1], x, y, z - 1),
                    this.grad(this.permutation[BA + 1], x - 1, y, z - 1)
                ),
                this.lerp(u,
                    this.grad(this.permutation[AB + 1], x, y - 1, z - 1),
                    this.grad(this.permutation[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    }
}
// Variables globales
let scene, camera, renderer, airplane;
let clouds = [];
let perlin = new PerlinNoise();
let speed = 0;
let altitude = 1000;
let pitch = 0;
let roll = 0;
let yaw = 0;
let gravity = 9.81;
let lift = 0;
let drag = 0;
let thrust = 0;
let mass = 1000;
let wingspan = 100;
let crashThreshold = 50;

// Configuración inicial
function init() {
    // Crear escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 1000, 10000);

    // Configurar cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    camera.position.set(0, 100, 300);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Iluminación
    setupLighting();

    // Crear elementos
    createAirplane();
    createTerrain();
    createClouds();

    // Eventos
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', onWindowResize, false);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(200, 500, 300);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 100;
    directionalLight.shadow.camera.far = 3000;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    scene.add(directionalLight);
}

function createCloud() {
    const cloudGroup = new THREE.Group();
    const cloudGeometry = new THREE.SphereGeometry(50, 16, 16);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    // Crear varias esferas para formar una nube
    for (let i = 0; i < 5; i++) {
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.x = Math.random() * 100 - 50;
        cloudPart.position.y = Math.random() * 50;
        cloudPart.position.z = Math.random() * 100 - 50;
        cloudPart.scale.set(
            Math.random() * 0.8 + 0.6,
            Math.random() * 0.8 + 0.6,
            Math.random() * 0.8 + 0.6
        );
        cloudGroup.add(cloudPart);
    }

    return cloudGroup;
}

function createClouds() {
    for (let i = 0; i < 50; i++) {
        const cloud = createCloud();
        cloud.position.set(
            Math.random() * 10000 - 5000,
            Math.random() * 2000 + 1000,
            Math.random() * 10000 - 5000
        );
        clouds.push(cloud);
        scene.add(cloud);
    }
}


function createTerrain() {
    const size = 200;
    const segments = 100;
    const geometry = new THREE.PlaneGeometry(10000, 10000, segments, segments);

    // Generar terreno con Perlin Noise
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i] / 100;
        const z = vertices[i + 2] / 100;

        // Usar múltiples octavas para más detalle
        let elevation = 0;
        elevation += perlin.noise(x * 0.5, z * 0.5) * 400;
        elevation += perlin.noise(x, z) * 200;
        elevation += perlin.noise(x * 2, z * 2) * 100;

        vertices[i + 1] = elevation;
    }

    geometry.computeVertexNormals();

    // Material del terreno con sombras
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a5f0f,
        flatShading: true,
        side: THREE.DoubleSide
    });

    const ground = new THREE.Mesh(geometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Océano
    const oceanGeometry = new THREE.PlaneGeometry(20000, 20000);
    const oceanMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.8
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -200;
    scene.add(ocean);
}

function calculateAerodynamics() {
    // Coeficientes
    const airDensity = 1.225; // kg/m³
    const liftCoefficient = 0.5;
    const dragCoefficient = 0.027;

    // Área del ala
    const wingArea = wingspan * wingspan / 8;

    // Velocidad al cuadrado
    const velocitySquared = speed * speed;

    // Calcular fuerzas
    lift = 0.5 * airDensity * velocitySquared * wingArea * liftCoefficient;
    drag = 0.5 * airDensity * velocitySquared * wingArea * dragCoefficient;

    // Ajustar thrust basado en la velocidad deseada
    thrust = drag + mass * gravity * Math.sin(pitch);

    // Aplicar fuerzas
    const netForceVertical = lift * Math.cos(roll) - mass * gravity + thrust * Math.sin(pitch);
    altitude += (netForceVertical / mass) * 0.016; // 0.016 es aproximadamente 1/60 para 60 FPS

    // Limitar la altitud mínima
    if (altitude < 0) {
        checkCrash();
    }
}

function checkCrash() {
    if (speed > crashThreshold || altitude < -10) {
        document.getElementById('status').textContent = '¡CRASH!';
        document.getElementById('status').style.color = 'red';
        // Reiniciar posición
        altitude = 1000;
        speed = 0;
        pitch = 0;
        roll = 0;
        yaw = 0;
        airplane.position.set(0, altitude, 0);
    } else {
        altitude = 0;
        speed *= 0.8; // Reducir velocidad al tocar suelo
    }
}

function createAirplane() {
    // [Mantener el código existente del avión]
    const geometry = new THREE.Group();

    // Fuselaje
    const bodyGeometry = new THREE.CylinderGeometry(5, 5, 40, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    geometry.add(body);

    // Alas
    const wingGeometry = new THREE.BoxGeometry(wingspan, 2, 20);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    geometry.add(wings);

    // Cola vertical
    const tailGeometry = new THREE.BoxGeometry(2, 20, 10);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-18, 10, 0);
    geometry.add(tail);

    // Cola horizontal
    const horizontalTailGeometry = new THREE.BoxGeometry(20, 2, 40);
    const horizontalTail = new THREE.Mesh(horizontalTailGeometry, tailMaterial);
    horizontalTail.position.set(-18, 5, 0);
    geometry.add(horizontalTail);

    airplane = geometry;
    airplane.castShadow = true;
    scene.add(airplane);

    airplane.position.y = altitude;
}

function handleKeyDown(event) {
    const rotationSpeed = 0.02;
    const speedChange = 1;

    switch (event.key) {
        case 'ArrowUp':
            pitch -= rotationSpeed;
            break;
        case 'ArrowDown':
            pitch += rotationSpeed;
            break;
        case 'ArrowLeft':
            roll -= rotationSpeed;
            yaw -= rotationSpeed;
            break;
        case 'ArrowRight':
            roll += rotationSpeed;
            yaw += rotationSpeed;
            break;
        case 'w':
            speed += speedChange;
            break;
        case 's':
            speed -= speedChange;
            break;
    }

    // Limitar valores
    pitch = Math.max(Math.min(pitch, Math.PI / 4), -Math.PI / 4);
    roll = Math.max(Math.min(roll, Math.PI / 2), -Math.PI / 2);
    speed = Math.max(Math.min(speed, 300), -50);
}

function updateHUD() {
    document.getElementById('speed').textContent = speed.toFixed(0);
    document.getElementById('altitude').textContent = altitude.toFixed(0);
    document.getElementById('pitch').textContent = (pitch * 180 / Math.PI).toFixed(1);
    document.getElementById('roll').textContent = (roll * 180 / Math.PI).toFixed(1);
    document.getElementById('yaw').textContent = (yaw * 180 / Math.PI).toFixed(1);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (airplane) {
        calculateAerodynamics();

        // Actualizar rotación del avión
        airplane.rotation.x = pitch;
        airplane.rotation.z = roll;
        airplane.rotation.y = yaw;

        // Actualizar posición
        airplane.position.y = altitude;
        airplane.position.x += speed * Math.cos(yaw);
        airplane.position.z += speed * Math.sin(yaw);

        // Actualizar cámara
        camera.position.x = airplane.position.x - 300 * Math.cos(yaw);
        camera.position.z = airplane.position.z - 300 * Math.sin(yaw);
        camera.position.y = airplane.position.y + 100;
        camera.lookAt(airplane.position);

        // Animar nubes
        clouds.forEach((cloud, index) => {
            cloud.position.x += Math.sin(Date.now() * 0.001 + index) * 0.2;
            cloud.position.y += Math.cos(Date.now() * 0.001 + index) * 0.1;
        });
    }

    updateHUD();
    renderer.render(scene, camera);
}

init();
animate();