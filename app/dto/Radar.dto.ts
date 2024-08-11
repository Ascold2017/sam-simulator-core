import Radar from "../core/Radar";
import RadarObject from "../radars/RadarObject";
import SearchRadar from "../radars/SearchRadar";
import SectorRadar from "../radars/SectorRadar";
import { Position } from "../types";

export type SectorRadarState = ReturnType<SectorRadar['getState']>
export type SearchRadarState = ReturnType<SearchRadar['getState']>

export class RadarDTO {
    private radar: Radar;
    id: string;
    position: Position;
    type: "search-radar" | "sector-radar" | "unknown" = 'unknown';
    minElevationAngle: number;
    maxElevationAngle: number;
    detectionRange: number;
    isEnabled: boolean;
    detectedFlightObjects: RadarObject[] = []
    azimuthAngle?: number;
    elevationAngle?: number;
    sweepAngle?: number;
    viewAngle?: number
    
    constructor(radar: Radar) {
        this.radar = radar;
        this.id = radar.id;
        this.position = {
            x: radar.body.position.x,
            y: radar.body.position.y,
            z: radar.body.position.z,
        };
        this.minElevationAngle = radar.minElevationAngle;
        this.maxElevationAngle = radar.maxElevationAngle;
        this.detectionRange = radar.detectionRange;
        this.isEnabled = radar.isEnabled;
        this.detectedFlightObjects = radar.getState().detectedFlightObjects;

        if (radar instanceof SearchRadar) {
            this.type = 'search-radar';
            this.sweepAngle = radar.getState().sweepAngle
        }
        if (radar instanceof SectorRadar) {
            this.type = 'sector-radar';
            this.azimuthAngle = radar.getState().azimuthAngle
            this.elevationAngle = radar.getState().elevationAngle
            this.viewAngle = radar.viewAngle
        }
    }
    
}
