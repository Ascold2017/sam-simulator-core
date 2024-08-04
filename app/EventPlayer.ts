import { Engine } from "./Engine";
import { Logger } from "./Logger";

export class EventPlayer {
    private engine: Engine;
    private logger: Logger;
    private playbackInterval: NodeJS.Timeout | null = null;

    constructor(engine: Engine, logger: Logger) {
        this.engine = engine;
        this.logger = logger;
    }

    playLog(speed: number = 1) {
        const log = this.logger.getLog();
        let index = 0;

        this.playbackInterval = setInterval(() => {
            if (index >= log.length) {
                clearInterval(this.playbackInterval!);
                this.playbackInterval = null;
                return;
            }

            const entry = log[index];
            this.handleEvent(entry.event, entry.data);
            index++;
        }, 1000 / speed);
    }

    stopPlayback() {
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
    }

    private handleEvent(event: string, data: any) {
        console.log(data)
        switch (event) {
            case "createFlightObject":
                this.engine.createFlightObject(data.id, data.waypoints);
                break;
            case "start":
                this.engine.start();
                break;
            case "stop":
                this.engine.stop();
                break;
            // Добавьте другие события здесь
            default:
                console.warn(`Unknown event: ${event}`);
        }
    }
}
