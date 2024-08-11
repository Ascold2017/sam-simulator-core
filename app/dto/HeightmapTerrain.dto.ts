import { Heightfield } from "cannon-es";
import HeightmapTerrain from "../core/HeightmapTerrain";

export class HeightmapTerrainDTO {
    id: string;
    data: number[][]
    elementSize: number
    constructor(heightmapTerrain: HeightmapTerrain) {
        this.id = heightmapTerrain.id;
        const shape = heightmapTerrain.body.shapes[0] as Heightfield;
        this.data = shape.data;
        this.elementSize = shape.elementSize;
    }
}