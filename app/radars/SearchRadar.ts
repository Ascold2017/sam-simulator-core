import Radar from '../core/Radar';
import * as CANNON from "cannon-es";

class SearchRadar extends Radar {
  constructor(id: string, body: CANNON.Body, minElevationAngle: number, maxElevationAngle: number) {
    super(id, body, minElevationAngle, maxElevationAngle);
  }

  scan() {
    // Specific logic for 360-degree scanning
    super.scan();
  }
}

export default SearchRadar;
