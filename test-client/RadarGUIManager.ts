import * as THREE from "three";
import { GUI } from "dat.gui";
import { Core } from "../app/index";
import Radar from "../app/core/Radar";
import SectorRadar from "../app/radars/SectorRadar";
import SearchRadar from "../app/radars/SearchRadar";
import { RadarDisplay } from "./RadarDisplay";

export class RadarGUIManager {
    private gui: GUI;
    private radarDisplays: Map<string, RadarDisplay> = new Map();

    constructor(
        private core: Core,
        private scene: THREE.Scene,
        private camera: THREE.Camera,
    ) {
        this.gui = new GUI();
        this.setupRadarGUI();
    }

    update() {
        // Обновляем положения дисплеев и их содержимое
        this.radarDisplays.forEach((display) => {
            display.update();
        });
    }

    private setupRadarGUI() {
        const radars = this.core.engine.getRadars();
        radars.forEach((radar: any) => {
            this.createRadarControls(radar);
            if (radar instanceof SearchRadar) {
                this.createRadarDisplay(radar);
            }
        });
    }

    private createRadarControls(radar: Radar) {
        const radarFolder = this.gui.addFolder(radar.id);
        radarFolder.add(radar, "isEnabled").name("Enabled").onChange(
            (value) => {
                this.core.radarManager.toggleRadarById(radar.id, value);
            },
        );

        if (radar instanceof SectorRadar) {
            radarFolder.add(radar, "azimuthAngle", 0, 2 * Math.PI).name(
                "Azimuth",
            )
                .onChange((value) => {
                    this.core.radarManager.setAngleSectorRadarById(
                        radar.id,
                        value,
                        radar.elevationAngle,
                    );
                })
                .listen();

            radarFolder.add(radar, "elevationAngle", 0, 2 * Math.PI).name(
                "Elevation",
            )
                .onChange((value) => {
                    this.core.radarManager.setAngleSectorRadarById(
                        radar.id,
                        radar.azimuthAngle,
                        value,
                    );
                })
                .listen();
        }
        radarFolder.open();
    }

    private createRadarDisplay(radar: SearchRadar) {
        const radarDisplay = new RadarDisplay(radar, this.scene, this.camera);
        this.radarDisplays.set(radar.id, radarDisplay);
    }
}
