import { Position } from "../types";
import Entity from "./Entity";
import * as CANNON from 'cannon-es'

interface AAParams {
    position: Position;
    type: 'active-missile' | 'gun',
    ammoVelocity: number;
    ammoMaxRange: number;
}
export class AAObject extends Entity {
    ammoMaxRange: number;
    ammoVelocity: number;
    type: 'active-missile' | 'gun';
    constructor(id: string, params: AAParams) {
        const body = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
        });

        body.position.set(params.position.x, params.position.y, params.position.z)

        super(id, body);

        this.ammoMaxRange = params.ammoMaxRange;
        this.ammoVelocity = params.ammoVelocity;
        this.type = params.type;
    }
}