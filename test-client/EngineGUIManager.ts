import { GUI } from "dat.gui";
import { Core } from "../app/index";

export class EngineGUIManager {
  private gui: GUI;

  constructor(private core: Core) {
    this.gui = new GUI();
    this.setupGUI();
  }

  private setupGUI() {
    const engineFolder = this.gui.addFolder("Engine Controls");
    engineFolder.add(this.core, 'startEngine').name("Start Engine");
    engineFolder.add(this.core, "stopEngine").name("Stop Engine");

    // Добавление ползунка для управления timeScale
    engineFolder.add(this.core, 'engineTimeScale', 0.1, 3)
      .name('Time Scale')
      .listen();

    engineFolder.open();
  }
}
