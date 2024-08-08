import * as CANNON from "cannon-es";
import Entity from './Entity';

// https://schteppe.github.io/cannon.js/docs/classes/Heightfield.html
class HeightmapTerrain extends Entity {
  constructor(data: number[][], elementSize: number) {
    const shape = new CANNON.Heightfield(data, {
      elementSize
    });
    
    const body = new CANNON.Body();
    body.addShape(shape);
    super('heightmap', body);
  }
}

export default HeightmapTerrain;
