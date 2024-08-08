import Camera from '../core/Camera';
import * as CANNON from "cannon-es";

class ThermalCamera extends Camera {
  constructor(id: string, body: CANNON.Body, minElevationAngle: number, maxElevationAngle: number, azimuthAngle: number, viewAngle: number) {
    super(id, body, minElevationAngle, maxElevationAngle, azimuthAngle, viewAngle);
  }

  look() {
    // Specific logic for thermal camera view
    super.look();
  }
}

export default ThermalCamera;
