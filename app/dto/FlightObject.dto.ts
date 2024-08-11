import FlightObject from "../core/FlightObject";
import ActiveMissile from "../flightObjects/ActiveMissile";
import Bullet from "../flightObjects/Bullet";
import TargetObject from "../flightObjects/TargetObject";
import { Position } from "../types";

export class FlightObjectDTO {
    id: string;
    isKilled: boolean;
    position: Position;
    type: 'target' | 'active-missile' | 'bullet' | 'unknown';
    constructor(flightObject: FlightObject) {
        this.id = flightObject.id;
        this.isKilled = flightObject.isKilled;
        this.position = {
            x: flightObject.body.position.x,
            y: flightObject.body.position.y,
            z: flightObject.body.position.z
        }
        this.type = (() => {
            if (flightObject instanceof TargetObject) return 'target'
            if (flightObject instanceof ActiveMissile) return 'active-missile'
            if (flightObject instanceof Bullet) return 'bullet'
            return 'unknown'
        })()
    }
}