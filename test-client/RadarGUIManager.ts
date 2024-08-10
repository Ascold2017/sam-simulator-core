import * as THREE from "three";
import { GUI } from "dat.gui";
import { Core } from "../app/index";

export class RadarGUIManager {
  private gui: GUI;

  constructor(private core: Core, private scene: THREE.Scene, private camera: THREE.Camera) {
    this.gui = new GUI();
    this.setupRadarGUI();
  }

  private setupRadarGUI() {
    const radars = this.core.engine.getRadars();
    radars.forEach((radar: any) => {
      this.createRadarControls(radar);
    });
  }
  private createRadarControls(radar: any) {
    const radarFolder = this.gui.addFolder(radar.id);
    radarFolder.add(radar, "isEnabled").name("Enabled");
    radarFolder.open();
  }
}
