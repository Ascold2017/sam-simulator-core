import { PhysicsEngine } from "./PhysicEngine";
import { FlightObject } from "./FlightObject";
import { Logger } from "./Logger";

type EventListener = (data: FlightObject[]) => void;

export class Engine {
    private physicsEngine: PhysicsEngine;
    private eventListeners: Map<string, EventListener[]>;
    private updateInterval: NodeJS.Timeout | null;
    private logger: Logger;
    constructor(logger: Logger) {
        this.physicsEngine = new PhysicsEngine();
        this.eventListeners = new Map();
        this.updateInterval = null;
        this.logger = logger;
    }

    createFlightObject(id: string, waypoints: Array<{ x: number, y: number, z: number, v: number }>): FlightObject {
        const flightObject = new FlightObject(id, waypoints, this.logger);
        this.addObject(flightObject);
        this.logger.record('createFlightObject', {
            id,
            waypoints
        });
        return flightObject;
    }

    killFlightObject(id: string) {
        this.physicsEngine.getObjects().find(obj => obj.id === id)?.kill()
    }

    start() {
        const deltaTime = 1 / 30; // 30 кадров в секунду
        this.updateInterval = setInterval(() => {
            this.update(deltaTime);
        }, deltaTime * 1000);
        this.logger.record('start', {});
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            this.logger.record('stop', {});
        }
    }

    private addObject(object: FlightObject) {
        this.physicsEngine.addObject(object);
        
    }

    private update(deltaTime: number) {
        this.physicsEngine.update(deltaTime);
        this.sendEvent("update", this.physicsEngine.getObjects());
    }

    public addEventListener(event: string, listener: EventListener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(listener);
    }

    public removeEventListener(event: string, listener: EventListener) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event)!;
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    private sendEvent(event: string, data: any) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event)!.forEach((listener) =>
                listener(data)
            );
        }
    }
}
