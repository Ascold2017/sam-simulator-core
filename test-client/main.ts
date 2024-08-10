import { Core, type MissionData } from "../app";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Entity from "../app/core/Entity";
import SearchRadar from "../app/radars/SearchRadar";
import HeightmapTerrain from "../app/core/HeightmapTerrain";
import FlightObject from "../app/core/FlightObject";
import Radar from "../app/core/Radar";
import Camera from "../app/core/Camera";

const core = new Core();
core.engine.start();
const missionData: MissionData = {
  map: {
    size: 100,
    data: [
      [0, 1, 2, 3, 4],
      [1, 2, 17, 20, 3],
      [2, 3, 5, 3, 2],
      [1, 2, 3, 2, 1],
      [0, 1, 50, 1, 0],
    ],
  },
  targets: [
    {
      id: "target1",
      rcs: 0.5,
      temperature: 50,
      size: 2,
      waypoints: [
        { position: { x: 0, y: 0, z: 10 }, speed: 20 },
        { position: { x: 50, y: 50, z: 16 }, speed: 17 },
        { position: { x: -20, y: -20, z: 9 }, speed: 15 },
      ],
    },
  ],
  radars: [
    {
      id: "radar1",
      type: "search",
      position: { x: 5, y: 10, z: 5 },
      minElevationAngle: 0,
      maxElevationAngle: Math.PI / 4,
      maxDistance: 10000,
      sweepSpeed: 0.5
    },
  ],
  cameras: [
    {
      id: "camera1",
      type: "tv",
      position: { x: 2, y: 7, z: 1 },
      minElevationAngle: -Math.PI / 6,
      maxElevationAngle: Math.PI / 6,
      azimuthAngle: Math.PI / 4,
      viewAngle: Math.PI / 3,
    },
  ],
};

core.missionManager.createEntities(missionData);
core.radarManager.subscribeToRadarUpdates("radar1", (radar) => {
  const searcRadar = radar as SearchRadar;
  console.log(searcRadar.getState())
});
core.radarManager.toggleRadarById("radar1", true);

setTimeout(() => core.targetManager.killTarget("target1"), 5000);
// СЦЕНА

core.engine.addEventListener("update", () => {
  updateScene(core.engine.getEntities());
});

const scene = new THREE.Scene();
const objects = new Map<string, { sphere: THREE.Mesh; text: THREE.Sprite }>();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000,
);

initScene();

function initScene() {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Добавление контроллера для управления камерой
  const controls = new OrbitControls(camera, renderer.domElement);

  // Добавление сетки
  const gridHelper = new THREE.GridHelper(100, 100);
  gridHelper.rotateX(-Math.PI / 2);
  scene.add(gridHelper);

  // Добавление осей
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const light = new THREE.AmbientLight()
  scene.add(light)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Направленный свет, имитирующий солнечный свет
  directionalLight.position.set(50, 50, 100).normalize();
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 1); // Точечный свет для дополнительных теней
  pointLight.position.set(10, 10, 50);
  scene.add(pointLight);

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  camera.position.set(0, -50, 50); // Позиционируем камеру для лучшего обзора
  camera.lookAt(0, 0, 0);
  animate();
}

function createTextSprite(message: string, parameters: any = {}) {
  const fontface = parameters.fontface || "Arial";
  const fontsize = parameters.fontsize || 18;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = `${fontsize}px ${fontface}`;

  // Размер текста
  const metrics = context.measureText(message);
  const textWidth = metrics.width;

  // Размер канваса
  canvas.width = textWidth;
  canvas.height = fontsize;

  // Настройки текста
  context.font = `${fontsize}px ${fontface}`;
  context.fillStyle = parameters.fillStyle || "rgba(255, 0, 0, 1.0)";
  context.fillText(message, 0, fontsize);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(textWidth / 10, fontsize / 10, 1);

  return sprite;
}

function updateScene(entities: Entity[]) {
  entities.forEach((obj) => {
    if (!objects.has(obj.id)) {
      let geometry: THREE.BufferGeometry;
      let material: THREE.MeshStandardMaterial;

      if (obj instanceof HeightmapTerrain) {
        const shape = obj.body.shapes[0] as unknown as CANNON.Heightfield;
        const { data, elementSize } = shape;
        
        // Создаем плоскость для террейна
        const terrainGeometry = new THREE.PlaneGeometry(
          elementSize * (data.length - 1),
          elementSize * (data[0].length - 1),
          data.length - 1,
          data[0].length - 1
        );

        const positionAttribute = terrainGeometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
          const x = i % data.length;
          const y = Math.floor(i / data.length);
          positionAttribute.setZ(i, data[y][x]);
        }

        positionAttribute.needsUpdate = true;
        terrainGeometry.computeVertexNormals();
        geometry = terrainGeometry;
        material = new THREE.MeshStandardMaterial({
          blendColor:  0x0000ff,
          color: 0x0000ff,
          wireframe: true
        });
      } else if (obj instanceof FlightObject) {
        geometry = new THREE.SphereGeometry(1, 32, 32);
        material = new THREE.MeshStandardMaterial({
          color: 0xff0000,
          wireframe: true,
        });
      } else if (obj instanceof Radar) {
        geometry = new THREE.SphereGeometry(1, 32, 32);
        material = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          wireframe: true,
        });
      } else if (obj instanceof Camera) {
        geometry = new THREE.SphereGeometry(1, 32, 32);
        material = new THREE.MeshStandardMaterial({
          color: 0xff00ff,
          wireframe: true,
        });
      } else {
        return;
      }

      const mesh = new THREE.Mesh(geometry, material);

      const text = createTextSprite(
        `${obj.body.position.x.toFixed(2)}|${obj.body.position.y.toFixed(2)}|${
          obj.body.position.z.toFixed(2)
        }`,
      );

      scene.add(mesh);
      scene.add(text);
      objects.set(obj.id, { sphere: mesh, text });
    }

    const objectData = objects.get(obj.id);
    if (objectData) {
      const { sphere, text } = objectData;
      sphere.position.set(
        obj.body.position.x,
        obj.body.position.y,
        obj.body.position.z,
      );

      // Обновляем текст и его позицию
      text.position.set(
        obj.body.position.x,
        obj.body.position.y,
        obj.body.position.z + 1.5, // Смещаем текст выше сферы
      );

      // Обновляем текстовое сообщение
      const newMessage = `${obj.body.position.x.toFixed(2)}|${
        obj.body.position.y.toFixed(2)
      }| ${obj.body.position.z.toFixed(2)}`;
      const newText = createTextSprite(newMessage);
      text.material.map = newText.material.map;

      // Направляем текст в камеру
      text.lookAt(camera.position);
    }
  });

  // Удаляем объекты, которые были удалены из движка
  objects.forEach((_, id) => {
    if (!entities.find((obj) => obj.id === id)) {
      const objectData = objects.get(id);
      if (objectData) {
        const { sphere, text } = objectData;
        scene.remove(sphere);
        scene.remove(text);
      }
      objects.delete(id);
    }
  });
}

