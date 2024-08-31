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

    // ОБЯЗАТЕЛЬНО ПОВОРАЧИВАЕМ И СМЕЩАЕМ В ЦЕНТР!!!
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    body.position.set(
      -((data.length - 1) * elementSize) / 2,
      0,
      ((data.length - 1) * elementSize) / 2,
    )

    super('heightmap', body);
  }
}

export default HeightmapTerrain;
