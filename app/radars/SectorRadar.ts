import Radar from '../core/Radar';
import * as CANNON from "cannon-es";


class SectorRadar extends Radar {
  azimuthAngle: number;
  viewAngle: number;

  constructor(id: string, body: CANNON.Body, minElevationAngle: number, maxElevationAngle: number, azimuthAngle: number, viewAngle: number) {
    super(id, body, minElevationAngle, maxElevationAngle);
    this.azimuthAngle = azimuthAngle;
    this.viewAngle = viewAngle;
  }

  scan() {
    // Specific logic for sector scanning
    super.scan();
  }
}

export default SectorRadar;
