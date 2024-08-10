import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Core } from "../app/index";
import { Heightfield } from "cannon-es";
import FlightObject from "../app/core/FlightObject";
import Radar from "../app/core/Radar";
import HeightmapTerrain from "../app/core/HeightmapTerrain";
import Camera from "../app/core/Camera";
import SearchRadar from "../app/radars/SearchRadar";

export class SceneInitializer {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private currentFlightObjects: Set<string> = new Set();

    constructor(private core: Core) {
        // Создание сцены
        this.scene = new THREE.Scene();

        const gridHelper = new THREE.GridHelper(1000);
        gridHelper.rotation.x = Math.PI / 2;
        this.scene.add(gridHelper);

        // Создание камеры
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        this.camera.position.set(50, -50, 10);

        // Настройка рендерера
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Настройка OrbitControls
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement,
        );

        // Добавление освещения
        this.addLighting();

        // Добавление объектов сцены из движка
        this.addEngineObjectsToScene();
    }

    updateScene() {
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
    }

    // Добавление освещения на сцену
    private addLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50).normalize();
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
        this.addRadars();
        this.addCameras();
        this.addHeightmapTerrain();
    }

    private addFlightObjects() {
        const flightObjects = this.core.engine.getFlightObjects();
        flightObjects.forEach((flightObject: any) => {
            const mesh = this.createMeshForFlightObject(flightObject);
            this.scene.add(mesh);
            this.currentFlightObjects.add(flightObject.id);
        });
    }

    private addRadars() {
        const radars = this.core.engine.getRadars();
        radars.forEach((radar: any) => {
            const mesh = this.createMeshForRadar(radar);
            this.scene.add(mesh);

            // Добавляем визуализацию лучей для SearchRadar
            if (radar instanceof SearchRadar) {
                const beamMesh = this.createBeamForSearchRadar(radar);
                this.scene.add(beamMesh);
            }
        });
    }

    private addCameras() {
        const cameras = this.core.engine.getCameras();
        cameras.forEach((camera: any) => {
            const mesh = this.createMeshForCamera(camera);
            this.scene.add(mesh);
        });
    }

    private addHeightmapTerrain() {
        const terrain = this.core.engine.getHeightmapTerrain();
        if (!terrain) return;
        const mesh = this.createMeshForTerrain(terrain);
        this.scene.add(mesh);
    }

    private createMeshForFlightObject(flightObject: FlightObject): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            flightObject.body.position.x,
            flightObject.body.position.y,
            flightObject.body.position.z,
        );
        mesh.name = flightObject.id;
        return mesh;
    }

    private createMeshForRadar(radar: Radar): THREE.Mesh {
        const geometry = new THREE.ConeGeometry(2, 5, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            radar.body.position.x,
            radar.body.position.y,
            radar.body.position.z,
        );
        mesh.rotation.x = Math.PI / 2;
        mesh.name = radar.id;

        return mesh;
    }

    private createBeamForSearchRadar(radar: SearchRadar): THREE.Mesh {
        const { detectionRange, minElevationAngle, maxElevationAngle, body } = radar;
        const angle = Math.PI / 60;
    
        // Создаем вершины пирамиды, корректируя ориентацию
        const vertices = new Float32Array([
            0, 0, 0, // Вершина пирамиды (позиция радара)

            detectionRange * Math.cos(minElevationAngle), 
            detectionRange * Math.sin(minElevationAngle) * Math.sin(-angle),
            detectionRange * Math.sin(minElevationAngle) * Math.cos(-angle),

            detectionRange * Math.cos(maxElevationAngle), 
            detectionRange * Math.sin(maxElevationAngle) * Math.sin(-angle),
            detectionRange * Math.sin(maxElevationAngle) * Math.cos(-angle),

            detectionRange * Math.cos(maxElevationAngle), 
            detectionRange * Math.sin(maxElevationAngle) * Math.sin(angle),
            detectionRange * Math.sin(maxElevationAngle) * Math.cos(angle),

            detectionRange * Math.cos(minElevationAngle), 
            detectionRange * Math.sin(minElevationAngle) * Math.sin(angle),
            detectionRange * Math.sin(minElevationAngle) * Math.cos(angle),
        ]);

        // Создаем индексы для соединения вершин в грани
        const indices = new Uint16Array([
            0, 1, 2, // Грань 1
            0, 2, 3, // Грань 2
            0, 3, 4, // Грань 3
            0, 4, 1, // Грань 4
            1, 2, 3, // Основание пирамиды
            1, 3, 4, // Основание пирамиды
        ]);
        const beamGeometry = new THREE.BufferGeometry();
        beamGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        beamGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
        beamGeometry.computeVertexNormals();
    
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            opacity: 0.5,
            transparent: true,
        });
    
        const mesh = new THREE.Mesh(beamGeometry, material);
    
        mesh.position.set(body.position.x, body.position.y, body.position.z);
    
        // Подписка на обновление sweepAngle для вращения пирамиды
        this.core.radarManager.subscribeToRadarUpdates(radar.id, () => {
            // Сначала вращаем пирамиду вокруг оси Z на sweepAngle
            mesh.rotation.set(0, 0, radar.getState().sweepAngle);
        });
    
        return mesh;
    }
    

    private createMeshForCamera(camera: Camera): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(1, 1, 5, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            camera.body.position.x,
            camera.body.position.y,
            camera.body.position.z,
        );
        mesh.rotation.x = Math.PI / 2;
        mesh.name = camera.id;
        return mesh;
    }

    private createMeshForTerrain(terrain: HeightmapTerrain): THREE.Mesh {
        const shape = terrain.body.shapes[0] as unknown as Heightfield;
        const { data, elementSize } = shape;

        const terrainGeometry = new THREE.PlaneGeometry(
            elementSize * (data.length - 1),
            elementSize * (data[0].length - 1),
            data.length - 1,
            data[0].length - 1,
        );

        const positionAttribute = terrainGeometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = i % data.length;
            const y = Math.floor(i / data.length);
            positionAttribute.setZ(i, data[y][x]);
        }

        positionAttribute.needsUpdate = true;
        terrainGeometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x0000ff,
            wireframe: false,
        });

        const mesh = new THREE.Mesh(terrainGeometry, material);

        mesh.name = terrain.id;
        return mesh;
    }

    public updateFlightObjects() {
        const flightObjects = this.core.engine.getFlightObjects();
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
                    flightObject.body.position.x,
                    flightObject.body.position.y,
                    flightObject.body.position.z,
                );
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
