import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Core } from "../app/index";
import { Heightfield } from "cannon-es";

export class SceneInitializer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;

  constructor(private core: Core) {
    // Создание сцены
    this.scene = new THREE.Scene();

    const gridHelper = new THREE.GridHelper(1000)
    gridHelper.rotation.x = Math.PI/2
    this.scene.add(gridHelper)

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
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Добавление освещения
    this.addLighting();

    // Добавление объектов сцены из движка
    this.addEngineObjectsToScene();
  }

  // Добавление освещения на сцену
  private addLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50).normalize();
    this.scene.add(directionalLight);

    const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
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
    });
  }

  private addRadars() {
    const radars = this.core.engine.getRadars();
    radars.forEach((radar: any) => {
      const mesh = this.createMeshForRadar(radar);
      this.scene.add(mesh);
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
    const mesh = this.createMeshForTerrain(terrain);
    this.scene.add(mesh);
  }

  private createMeshForFlightObject(flightObject: any): THREE.Mesh {
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

  private createMeshForRadar(radar: any): THREE.Mesh {
    const geometry = new THREE.ConeGeometry(2, 5, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(radar.body.position.x, radar.body.position.y, radar.body.position.z);
    mesh.rotation.x = Math.PI / 2;
    mesh.name = radar.id;
    return mesh;
  }

  private createMeshForCamera(camera: any): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(1, 1, 5, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(camera.body.position.x, camera.body.position.y, camera.body.position.z);
    mesh.rotation.x = Math.PI / 2;
    mesh.name = camera.id;
    return mesh;
  }

  private createMeshForTerrain(terrain: any): THREE.Mesh {
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
}
