import Radar, { RadarConstructor } from '../core/Radar';

interface SectorRadarConstructor extends RadarConstructor {
  viewAngle: number
}
class SectorRadar extends Radar {
  private elevationAngle: number;
  private azimuthAngle: number;
  viewAngle: number;

  constructor({ viewAngle, ...radarParams }: SectorRadarConstructor) {
    super(radarParams);
    this.azimuthAngle = 0;
    this.elevationAngle = 0;
    this.viewAngle = viewAngle;
  }

  scan(deltaTime: number) {
  }
}

export default SectorRadar;
