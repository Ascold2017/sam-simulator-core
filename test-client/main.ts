import { Core, MissionData } from "../app/index";
import { SceneInitializer } from "./SceneInitializer";
import { EngineGUIManager } from "./EngineGUIManager";
import { RadarGUIManager } from "./RadarGUIManager";
import { missionData } from "./missionData";

class TestClient {
  private core: Core;
  private sceneInitializer: SceneInitializer;
  private engineGUIManager: EngineGUIManager;
  private radarGUIManager: RadarGUIManager;

  constructor() {
    this.core = new Core();

    // Инициализация миссии
    this.initializeMission();

    // Инициализация сцены
    this.sceneInitializer = new SceneInitializer(this.core);

    // Инициализация GUI для управления движком
    this.engineGUIManager = new EngineGUIManager(this.core);

    // Инициализация GUI для радаров
    this.radarGUIManager = new RadarGUIManager(
      this.core,
      this.sceneInitializer.scene,
      this.sceneInitializer.camera,
    );

    // Подписка на обновление движка
    this.core.engine.addEventListener("update", this.updateScene.bind(this));

    // Запуск рендер-цикла
    this.animate();
  }

  // Инициализация миссии
  private initializeMission() {
    this.core.missionManager.createEntities(missionData);
  }

  // Обновление сцены
  private updateScene() {
    this.core.engine.getFlightObjects().forEach((obj) => {
      const mesh = this.sceneInitializer.scene.getObjectByName(obj.id);
      if (mesh) {
        mesh.position.set(obj.body.position.x, obj.body.position.y, obj.body.position.z);
      }
    });
  }

  // Рендер-цикл
  private animate() {
    requestAnimationFrame(() => this.animate());

    this.sceneInitializer.renderer.render(this.sceneInitializer.scene, this.sceneInitializer.camera);
    this.sceneInitializer.controls.update();
  }
}

// Запуск клиента
window.onload = () => {
  new TestClient();
};
