import { Core, MissionData } from "../app/index";
import { SceneInitializer } from "./SceneInitializer";
import { EngineGUIManager } from "./EngineGUIManager";
import { missionData } from "./missionData";

class TestClient {
  private core: Core;
  private sceneInitializer: SceneInitializer;
  private engineGUIManager: EngineGUIManager;

  constructor() {
    this.core = new Core();

    // Инициализация миссии
    this.core.startMission(missionData);

    // Инициализация сцены
    this.sceneInitializer = new SceneInitializer(this.core);

    // Инициализация GUI для управления движком
    this.engineGUIManager = new EngineGUIManager(this.core);

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
  }
}

// Запуск клиента
window.onload = () => {
  new TestClient();
};
