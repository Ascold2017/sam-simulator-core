import { Engine, EventPlayer, FlightObject, Logger } from "../app";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const logger = new Logger();
const engine = new Engine(logger);

engine.createFlightObject('test', [
  { x: 0, y: 0, z: 10, v: 10 },
  { x: 10, y: 10, z: 10, v: 10 },
  { x: 20, y: 20, z: 10, v: 10 },
  { x: 15, y: 30, z: 10, v: 10 },
]);
engine.start();

/*
setTimeout(() => {
  flightObject1.kill();
}, 3000); // Убиваем объект через 3 секунд для демонстрации
*/

// СЦЕНА
engine.addEventListener("update", updateScene);
const scene = new THREE.Scene();
const objects = new Map<string, THREE.Mesh>();

initScene();

function initScene() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
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

function updateScene(flightObjects: FlightObject[]) {
  flightObjects.forEach((obj) => {
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
      // Перекрашиваем объект в красный, если он убит
      if (obj.isKilled) {
        (sphere.material as THREE.MeshBasicMaterial).color.set(0xff0000);
      }
    }
  });

  // Удаляем объекты, которые были удалены из движка
  objects.forEach((_, id) => {
    if (!flightObjects.find((obj) => obj.id === id)) {
     
      const mesh = objects.get(id);
      if (mesh) {
        scene.remove(mesh);
      }
      objects.delete(id);
    }
  });
}


setTimeout(() => {
  engine.killFlightObject('test')
}, 3000)

setTimeout(() => {
  engine.stop();
// Воспроизведение лога событий
console.log(logger.getLog())
}, 5000)
