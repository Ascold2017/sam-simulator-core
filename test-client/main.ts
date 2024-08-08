import { Core, type MissionData } from "../app";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Entity from "../app/core/Entity";

const core = new Core()
core.engine.start();
const missionData: MissionData = {
  map: {
    size: 1,
    data: [70, 100, 87, 36, 35, 34, 56, 59]
  },
  targets: [
    {
      id: 'target1',
      position: { x: 0, y: 0, z: 100 },
      speed: 10,
      rcs: 1,
      temperature: 50,
      size: 2,
      waypoints: [
        { position: { x: 0, y: 0, z: 100 }, speed: 200 },
        { position: { x: 10, y: 1200, z: 120 }, speed: 170 },
        { position: { x: 1800, y: 1300, z: 110 }, speed: 150 }
      ]
    }
  ],
  radars: [
    {
      id: 'radar1',
      type: 'search',
      position: { x: 5, y: 10, z: 5 },
      minElevationAngle: -Math.PI / 6,
      maxElevationAngle: Math.PI / 6
    }
  ],
  cameras: [
    {
      id: 'camera1',
      type: 'tv',
      position: { x: 2, y: 7, z: 1 },
      minElevationAngle: -Math.PI / 6,
      maxElevationAngle: Math.PI / 6,
      azimuthAngle: Math.PI / 4,
      viewAngle: Math.PI / 3
    }
  ]
};

core.missionManager.createEntities(missionData);


// СЦЕНА

core.engine.addEventListener("update", () => {
  updateScene(core.engine.entities)
});

const scene = new THREE.Scene();
const objects = new Map<string, THREE.Mesh>();

initScene();
updateScene(core.engine.entities)

function initScene() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000,
  );
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

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  camera.position.set(0, -50, 50); // Позиционируем камеру для лучшего обзора
  camera.lookAt(0, 0, 0);
  animate();
}


function updateScene(entities: Entity[]) {
  entities.forEach((obj) => {
    if (!objects.has(obj.id)) {
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      objects.set(obj.id, sphere);
    }

    const sphere = objects.get(obj.id);
    if (sphere) {
      sphere.position.set(
        obj.body.position.x,
        obj.body.position.y,
        obj.body.position.z,
      );
    }
  });

  // Удаляем объекты, которые были удалены из движка
  objects.forEach((_, id) => {
    if (!entities.find((obj) => obj.id === id)) {
      const mesh = objects.get(id);
      if (mesh) {
        scene.remove(mesh);
      }
      objects.delete(id);
    }
  });
}

