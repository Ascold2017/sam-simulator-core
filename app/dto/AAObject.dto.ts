import { AAObject } from "../core/AAObject";
import { Position } from "../types";

export class AAObjectDTO {
    id: string;
    position: Position;
    type: 'active-missile' | 'gun';
    ammoVelocity: number;
    ammoMaxRange: number;
    constructor(aa: AAObject) {
        this.id = aa.id;
        this.type = aa.type;
        this.ammoMaxRange = aa.ammoMaxRange;
        this.ammoVelocity = aa.ammoVelocity;
        this.position = {
            x: aa.body.position.x,
            y: aa.body.position.y,
            z: aa.body.position.z
        }

    }
}