import * as THREE from "three";
import { GUI } from "dat.gui";
import { Core, RadarDTO } from "../app/index";
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
        this.radarDisplays.forEach((display, id) => {
            display.update(this.core.getRadars().find(r => r.id === id)!);
        });
    }

    private setupRadarGUI() {
        const radars = this.core.getRadars();
        radars.forEach((radar) => {
            this.createRadarControls(radar);
            if (radar.type === 'search-radar') {
                this.createRadarDisplay(radar);
            }
        });
    }

    private createRadarControls(radar: RadarDTO) {
        const radarFolder = this.gui.addFolder(radar.id);
        radarFolder.add(radar, "isEnabled").name("Enabled").onChange(
            (value) => {
                this.core.radarManager.toggleRadarById(radar.id, value);
            },
        );

        if (radar.type === 'sector-radar') {
            radarFolder.add(radar, "azimuthAngle", 0, 2 * Math.PI).name(
                "Azimuth",
            )
                .onChange((value) => {
                    this.core.radarManager.setAngleSectorRadarById(
                        radar.id,
                        value,
                        radar.elevationAngle!,
                    );
                })
                .listen();

            radarFolder.add(radar, "elevationAngle", 0,  Math.PI / 4).name(
                "Elevation",
            )
                .onChange((value) => {
                    this.core.radarManager.setAngleSectorRadarById(
                        radar.id,
                        radar.azimuthAngle!,
                        value,
                    );
                })
                .listen();
        }
        radarFolder.open();
    }

    private createRadarDisplay(radar: RadarDTO) {
        const radarDisplay = new RadarDisplay(radar, this.scene, this.camera);
        this.radarDisplays.set(radar.id, radarDisplay);
    }
}
