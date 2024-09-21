import Entity from "./Entity";
import * as CANNON from "cannon-es";

export default class SphereEntity extends Entity {
    private hasCollided: boolean = false;
    constructor(position: CANNON.Vec3) {
      const shape = new CANNON.Sphere(10);
      const body = new CANNON.Body({
        mass: 1,
        shape,
        position,
        material: new CANNON.Material({ friction: 1, restitution: 0 }),
      });
  
      super("sphere", body);
  
      this.body.addEventListener("collide", (event: any) => {
        const targetBody = event.body; // объект, с которым произошло столкновение
        if (targetBody && targetBody.shapes.length > 0) {
          // Проверяем, является ли объект землей (Heightfield)
          const isHeightfield = targetBody.mass === 0;
          if (isHeightfield) {
            this.hasCollided = true;
          }
        }
      });
    }
  
    update(deltaTime: number) {
      super.update(deltaTime);
      // Если произошло столкновение с землёй, останавливаем движение
      if (this.hasCollided) {
        this.body.velocity.set(0, 0, 0); // Останавливаем скорость
        this.body.angularVelocity.set(0, 0, 0); // Останавливаем вращение
        this.body.mass = 0; // Превращаем объект в статический, чтобы он больше не двигался
      } else {
        // Применяем гравитацию только если сфера еще не столкнулась с землёй
        this.body.applyForce(
          new CANNON.Vec3(0, -this.body.mass * 100, 0),
          this.body.position
        );
      }
    }
  
    getState() {
      return {
        ...super.getState(),
        radius: 10,
        type: "sphere",
      };
    }
  }