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
    engineFolder.add(this.core.engine, "start").name("Start Engine");
    engineFolder.add(this.core.engine, "stop").name("Stop Engine");

    // Добавление ползунка для управления timeScale
    engineFolder.add(this.core.engine, 'timeScale', 0.1, 3)
      .name('Time Scale')
      .onChange((value: number) => {
        this.core.engine.setTimeScale(value);
      })
      .listen();

    engineFolder.open();
  }
}
