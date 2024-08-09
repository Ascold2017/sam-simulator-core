export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface MapData {
    size: number;
    data: number[][];
}

export interface TargetData {
    id: string;
    rcs: number;
    temperature: number;
    size: number;
    waypoints: Waypoint[];
}

export interface RadarData {
    id: string;
    type: "search" | "sector";
    position: Position;
    minElevationAngle: number;
    maxElevationAngle: number;
    azimuthAngle?: number;
    viewAngle?: number;
}

export interface CameraData {
    id: string;
    type: "tv" | "thermal";
    position: Position;
    minElevationAngle: number;
    maxElevationAngle: number;
    azimuthAngle: number;
    viewAngle: number;
}

export interface MissionData {
    map: MapData;
    targets: TargetData[];
    radars: RadarData[];
    cameras: CameraData[];
}

export interface Waypoint {
    position: Position;
    speed: number; // скорость в метрах в секунду
}

export interface RouteData {
    targetId: string;
    waypoints: Waypoint[];
}
