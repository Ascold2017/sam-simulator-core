import * as CANNON from "cannon-es";

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

export interface AAPosition {
    id: number;
    position: Position;
}
export interface AAData {
    id: string;
    position: Position;
    type: 'missile' | 'gun',
    ammoVelocity: number;
    ammoMaxRange: number;
    ammoKillRadius: number;
    captureAngle: number;
}

export interface MissionData {
    map: MapData;
    targets: TargetData[];
    aaPositions: AAPosition[]
}

export interface Waypoint {
    position: Position;
    speed: number; // скорость в метрах в секунду
}

export interface RouteData {
    targetId: string;
    waypoints: Waypoint[];
}

export interface CreateWeaponChannelPayload {
    position: Position;
    captureAngle: number;
    weaponParams: MissilePayload;
}

export interface MissilePayload {
    maxRange: number
    speed: number
    killRadius: number
  }
  
  export interface WeaponChannel {
    missileId?: string
    targetId?: string;
    rayDirection: CANNON.Vec3
    captureAngle: number;
    position: CANNON.Vec3;
    weaponParams: MissilePayload;
  }