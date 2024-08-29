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

    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

    super('heightmap', body);
  }
}

export default HeightmapTerrain;
