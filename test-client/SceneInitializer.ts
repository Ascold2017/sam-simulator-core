import * as THREE from "three";

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
    Core,
    FlightObjectDTO,
    HeightmapTerrainDTO,
} from "../app/index";

export class SceneInitializer {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private currentFlightObjects: Set<string> = new Set();
    private smokeParticles: Map<string, THREE.Points> = new Map();

    constructor(private core: Core) {
        // Создание сцены
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Светло-голубой цвет

        const gridHelper = new THREE.GridHelper(1000);
        this.scene.add(gridHelper);

        const axisHelper = new THREE.AxesHelper(100)
        this.scene.add(axisHelper)

        // Создание камеры
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000,
        );
        this.camera.position.set(0, 300, -500);
        this.camera.lookAt(0, 0, 0);

        // Настройка рендерера
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Настройка OrbitControls
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement,
        );
        this.controls.listenToKeyEvents(window);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.05;

        this.controls.screenSpacePanning = false;

        this.controls.minDistance = 100;
        this.controls.maxDistance = 1000;

        this.controls.maxPolarAngle = Math.PI / 2;

        // Добавление освещения
        this.addLighting();

        // Добавление объектов сцены из движка
        this.addEngineObjectsToScene();
    }

    updateScene() {
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
        this.updateSmokeTrails();
    }

    // Добавление освещения на сцену
    private addLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 500, 50).normalize();
        directionalLight.lookAt(0, 0, 0);
        this.scene.add(directionalLight);

        const dirLightHelper = new THREE.DirectionalLightHelper(
            directionalLight,
            10,
        );
        this.scene.add(dirLightHelper);
    }

    // Добавление объектов из движка на сцену
    private addEngineObjectsToScene() {
        this.addFlightObjects();
        this.addHeightmapTerrain();
    }

    private addFlightObjects() {
        const flightObjects = this.core.getFlightObjects();
        flightObjects.forEach((flightObject: any) => {
            const mesh = this.createMeshForFlightObject(flightObject);
            this.scene.add(mesh);
            this.currentFlightObjects.add(flightObject.id);
        });
    }


    private addHeightmapTerrain() {
        const terrain = this.core.getHeightmapTerrain();
        if (!terrain) return;
        const mesh = this.createMeshForTerrain(terrain);
        this.scene.add(mesh);
    }

    private createMeshForFlightObject(
        flightObject: FlightObjectDTO,
    ): THREE.Mesh {
        let geometry: THREE.BufferGeometry;
        let material: THREE.MeshStandardMaterial;

        switch (flightObject.type) {
            case "target":
                geometry = new THREE.SphereGeometry(5, 32, 32); // Красный шар для цели
                material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                break;
            case "active-missile":
                geometry = new THREE.CylinderGeometry(2, 2, 10, 32); // Зеленый цилиндр для ракеты
                material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
                break;
            case "bullet":
                geometry = new THREE.SphereGeometry(2, 32, 32); // Желтый шарик для пули
                material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
                break;
            default:
                geometry = new THREE.BoxGeometry(5, 5, 5); // На случай неизвестного типа
                material = new THREE.MeshStandardMaterial({ color: 0xffffff });
                break;
        }
        // Apply position
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            flightObject.position.x,
            flightObject.position.y,
            flightObject.position.z,
        );
        mesh.name = flightObject.id;
        // Apply rotation
        const velocity = new THREE.Vector3(
            flightObject.velocity.x,
            flightObject.velocity.y,
            flightObject.velocity.z,
        );
        velocity.normalize();

        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
            axis,
            velocity,
        );
        mesh.quaternion.copy(quaternion);

        this.addSmokeTrail(flightObject.id, mesh);

        return mesh;
    }


    private createMeshForTerrain(terrain: HeightmapTerrainDTO): THREE.Mesh {
        const { data, elementSize } = terrain;

        // Создаем геометрию на основе матрицы высот
        const width = (data.length - 1) * elementSize;
        const height = (data[0].length - 1) * elementSize;
        const terrainGeometry = new THREE.PlaneGeometry(width, height, data.length - 1, data[0].length - 1);


        // Модифицируем вершины геометрии на основе матрицы высот
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                const vertexIndex = i * data[i].length + j;
                const heightValue = data[i][j];

                // Устанавливаем высоту (Z) для каждой вершины
                terrainGeometry.attributes.position.setZ(vertexIndex, heightValue);
                // Устанавливаем позиции X и Y с учетом elementSize
                const x = (j - (data[i].length - 1) / 2) * elementSize;
                const y = (i - (data.length - 1) / 2) * elementSize;
                terrainGeometry.attributes.position.setX(vertexIndex, x);
                terrainGeometry.attributes.position.setY(vertexIndex, y);
            }
        }

        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x0000ff,
            side: THREE.BackSide
        });

        const mesh = new THREE.Mesh(terrainGeometry, material);

        mesh.rotation.x = -Math.PI / 2
        mesh.name = terrain.id;
        return mesh;
    }

    private addSmokeTrail(missileId: string, missileMesh: THREE.Mesh) {
        const particleCount = 100;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x555555,
            size: 10,
            transparent: true,
            opacity: 0.7,
        });

        const smokeTrail = new THREE.Points(particlesGeometry, particlesMaterial);
        smokeTrail.userData = { missileMesh, lastPosition: new THREE.Vector3() };
        this.scene.add(smokeTrail);
        this.smokeParticles.set(missileId, smokeTrail);
    }

    private updateSmokeTrails() {
        this.smokeParticles.forEach((smokeTrail) => {
            const { missileMesh, lastPosition } = smokeTrail.userData;
            const positions = smokeTrail.geometry.attributes.position.array;

            lastPosition.copy(missileMesh.position);

            for (let i = positions.length - 3; i > 0; i -= 3) {
                positions[i] = positions[i - 3];
                positions[i + 1] = positions[i - 2];
                positions[i + 2] = positions[i - 1];
            }

            positions[0] = missileMesh.position.x;
            positions[1] = missileMesh.position.y;
            positions[2] = missileMesh.position.z;

            smokeTrail.geometry.attributes.position.needsUpdate = true;
        });
    }


    public updateFlightObjects() {
        const flightObjects = this.core.getFlightObjects();
        const existingMeshes = this.scene.children.filter(
            (obj) => this.currentFlightObjects.has(obj.name),
        );
        // Обновление или добавление объектов
        flightObjects.forEach((flightObject) => {
            let mesh = this.scene.getObjectByName(flightObject.id);
            if (!mesh) {
                mesh = this.createMeshForFlightObject(flightObject);
                this.scene.add(mesh);
                this.currentFlightObjects.add(flightObject.id);
            } else {
                mesh.position.set(
                    flightObject.position.x,
                    flightObject.position.y,
                    flightObject.position.z,
                );
                const velocity = new THREE.Vector3(
                    flightObject.velocity.x,
                    flightObject.velocity.y,
                    flightObject.velocity.z,
                );
                velocity.normalize();
                const axis = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(
                    axis,
                    velocity,
                );
                mesh.quaternion.copy(quaternion);
            }
        });

        // Удаление объектов, которых нет в списке flightObjects
        existingMeshes.forEach((mesh) => {
            const objectExists = flightObjects.some((obj) =>
                obj.id === mesh.name
            );
            if (!objectExists) {
                this.scene.remove(mesh);
                this.currentFlightObjects.delete(mesh.name);
            }
        });
    }
}
