import * as CANNON from "cannon-es";
import Entity from './Entity';

class HeightmapTerrain extends Entity {
  constructor(data: number[][], elementSize: number) {
    
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.STATIC,
      shape: new CANNON.Heightfield(data, {
        elementSize
      })
    });

    super('heightmap', body);
  }
}

export default HeightmapTerrain;
