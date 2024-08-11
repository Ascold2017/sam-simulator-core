import { Core, MissionData } from "../app/index";
import { SceneInitializer } from "./SceneInitializer";
import { EngineGUIManager } from "./EngineGUIManager";
import { RadarGUIManager } from "./RadarGUIManager";
import { missionData } from "./missionData";
import { weaponGUIManager } from "./WeaponGUIManager";

class TestClient {
  private core: Core;
  private sceneInitializer: SceneInitializer;
  private engineGUIManager: EngineGUIManager;
  private radarGUIManager: RadarGUIManager;
  private weaponGUIManager: weaponGUIManager;

  constructor() {
    this.core = new Core();

    // Инициализация миссии
    this.core.startMission(missionData);

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

    this.weaponGUIManager = new weaponGUIManager(this.core)
    // Подписка на обновление движка
    this.core.updateListener = () => {
      this.sceneInitializer.updateFlightObjects();
    };

    // Запуск рендер-цикла
    this.animate();
  }

  // Рендер-цикл
  private animate() {
    requestAnimationFrame(() => this.animate());

    this.sceneInitializer.updateScene();
    this.radarGUIManager.update();
  }
}

// Запуск клиента
window.onload = () => {
  new TestClient();
};
