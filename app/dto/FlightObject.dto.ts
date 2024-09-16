import FlightObject from "../core/FlightObject";
import Missile from "../flightObjects/Missile";
import Bullet from "../flightObjects/Bullet";
import TargetObject from "../flightObjects/TargetObject";
import { Position } from "../types";

export class FlightObjectDTO {
    id: string;
    isKilled: boolean;
    position: Position;
    velocity: Position;
    type: 'target' | 'missile' | 'bullet' | 'unknown';
    constructor(flightObject: FlightObject) {
        this.id = flightObject.id;
        this.isKilled = flightObject.isKilled;
        this.position = {
            x: flightObject.body.position.x,
            y: flightObject.body.position.y,
            z: flightObject.body.position.z
        }
        this.velocity = {
            x: flightObject.body.velocity.x,
            y: flightObject.body.velocity.y,
            z: flightObject.body.velocity.z
        }
        this.type = (() => {
            if (flightObject instanceof TargetObject) return 'target'
            if (flightObject instanceof Missile) return 'missile'
            if (flightObject instanceof Bullet) return 'bullet'
            return 'unknown'
        })()
    }
}