import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Core, FlightObjectDTO, RadarDTO, HeightmapTerrainDTO, SectorRadarState, SearchRadarState } from "../app/index";
import Camera from "../app/core/Camera";

export class SceneInitializer {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private currentFlightObjects: Set<string> = new Set();

    constructor(private core: Core) {
        // Создание сцены
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Светло-голубой цвет

        const gridHelper = new THREE.GridHelper(1000);
        gridHelper.rotation.x = Math.PI / 2;
        this.scene.add(gridHelper);

        // Создание камеры
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000,
        );
        this.camera.position.set(100, -100, 100);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))
        

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
        directionalLight.position.set(50, 50, 500).normalize();
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
        this.addRadars();
        this.addCameras();
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

    private addRadars() {
        const radars = this.core.getRadars();
        radars.forEach((radar) => {
            const mesh = this.createMeshForRadar(radar);
            this.scene.add(mesh);

            // Добавляем визуализацию лучей для SearchRadar
            if (radar.type === 'search-radar') {
                const beamMesh = this.createBeamForSearchRadar(radar);
                this.scene.add(beamMesh);
            }
            // Добавляем визуализацию лучей для SectorRadar
            if (radar.type === 'sector-radar') {
                const beamMesh = this.createBeamForSectorRadar(radar);
                this.scene.add(beamMesh);
            }
        });
    }

    private addCameras() {
        const cameras = this.core.getCameras();
        cameras.forEach((camera: any) => {
            const mesh = this.createMeshForCamera(camera);
            this.scene.add(mesh);
        });
    }

    private addHeightmapTerrain() {
        const terrain = this.core.getHeightmapTerrain();
        if (!terrain) return;
        const mesh = this.createMeshForTerrain(terrain);
        this.scene.add(mesh);
    }

    private createMeshForFlightObject(flightObject: FlightObjectDTO): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(10, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            flightObject.position.x,
            flightObject.position.y,
            flightObject.position.z,
        );
        mesh.name = flightObject.id;
        return mesh;
    }

    private createMeshForRadar(radar: RadarDTO): THREE.Mesh {
        const geometry = new THREE.ConeGeometry(2, 5, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            radar.position.x,
            radar.position.y,
            radar.position.z,
        );
        mesh.rotation.x = Math.PI / 2;
        mesh.name = radar.id;

        return mesh;
    }

    private createBeamForSearchRadar(radar: RadarDTO): THREE.Mesh {
        const { detectionRange, minElevationAngle, maxElevationAngle, position } =
            radar;
        const angle = Math.PI / 60;

        // Создаем вершины пирамиды, корректируя ориентацию
        const vertices = new Float32Array([
            0,
            0,
            0, // Вершина пирамиды (позиция радара)

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
            0,
            1,
            2, // Грань 1
            0,
            2,
            3, // Грань 2
            0,
            3,
            4, // Грань 3
            0,
            4,
            1, // Грань 4
            1,
            2,
            3, // Основание пирамиды
            1,
            3,
            4, // Основание пирамиды
        ]);
        const beamGeometry = new THREE.BufferGeometry();
        beamGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(vertices, 3),
        );
        beamGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
        beamGeometry.computeVertexNormals();

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            opacity: 0.5,
            transparent: true,
        });

        const mesh = new THREE.Mesh(beamGeometry, material);

        mesh.position.set(position.x, position.y, position.z);

        // Подписка на обновление sweepAngle для вращения пирамиды
        this.core.radarManager.subscribeToRadarUpdates(radar.id, (radarState) => {
            const { sweepAngle } = radarState as SearchRadarState
            // Сначала вращаем пирамиду вокруг оси Z на sweepAngle
            mesh.rotation.set(0, 0, sweepAngle);
        });

        return mesh;
    }

    private createBeamForSectorRadar(radar: RadarDTO): THREE.Group {
        const {
            detectionRange,
            viewAngle,
            position,
        } = radar;

        // Создаем геометрию конуса
        const geometry = new THREE.ConeGeometry(
            detectionRange * Math.tan(viewAngle! / 2),
            detectionRange,
            32,
        );

        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000, // Красный цвет для луча
            wireframe: true,
            opacity: 0.5,
            transparent: true,
        });

        const cone = new THREE.Mesh(geometry, material);

        // Положение конуса: смещаем его вдоль оси Z на половину высоты конуса, чтобы вершина была в позиции радара
        cone.position.set(detectionRange / 2, 0, 0);
        cone.rotation.set(Math.PI / 2, 0, Math.PI / 2); // Повернем конус, чтобы он был направлен вдоль оси Y

        // Создаем группу для вращения вокруг вершины
        const pivot = new THREE.Group();
        pivot.position.set(position.x, position.y, position.z);
        pivot.add(cone);

        // Подписка на обновление sweepAngle для вращения пирамиды
        this.core.radarManager.subscribeToRadarUpdates(radar.id, (radarState) => {
            const { azimuthAngle, elevationAngle } = radarState as SectorRadarState;

            // Создаем кватернионы для азимута и возвышения
            const azimuthQuaternion = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, 0, 1), // Вращаем вокруг оси Y
                azimuthAngle,
            );

            const elevationQuaternion = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, -1, 0), // Вращаем вокруг оси X
                elevationAngle,
            );

            // Применяем оба вращения
            pivot.quaternion.copy(azimuthQuaternion).multiply(
                elevationQuaternion,
            );
        });

        return pivot;
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

    private createMeshForTerrain(terrain: HeightmapTerrainDTO): THREE.Mesh {
        const { data, elementSize } = terrain;

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
