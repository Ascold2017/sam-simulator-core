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
      this.createRadarDisplay(radar);
      this.createRadarControls(radar);
    });
  }

  private createRadarDisplay(radar: any) {
    const displaySize = 100;
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(displaySize, displaySize),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );

    display.position.set(150, 150, 0); // Примерное положение
    display.lookAt(this.camera.position);

    this.scene.add(display);
  }

  private createRadarControls(radar: any) {
    const radarFolder = this.gui.addFolder(radar.id);
    radarFolder.add(radar, "isEnabled").name("Enabled");
    radarFolder.open();
  }
}
