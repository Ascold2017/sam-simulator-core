import { defineStore } from "pinia";
import { Core } from "../../app";
import { data } from "./assets/coreData";
import { computed, ref } from "vue";
import type { TargetNPCState } from "../../app/entities/TargetNPC";
import type { AAState } from "../../app/entities/AA";
import type { GuidedMissileState } from "../../app/entities/GuidedMissile";
import type { EntityState } from "../../app/entities/Entity";
import * as THREE from "three";

export const useStore = defineStore("my-store", () => {
  const core = new Core(data);

  const myAAId = ref("aa-01");

  const spheres = ref<EntityState[]>([]);
  const targetNPCs = ref<TargetNPCState[]>([]);
  const guidedMissiles = ref<GuidedMissileState[]>([]);
  const aas = ref<AAState[]>([]);

  core.eventEmitter.on("update_world_state", (data) => {
    spheres.value = data.filter((i) => i.type === "sphere") as any[];

    targetNPCs.value = data.filter(
      (i) => i.type === "target-npc"
    ) as TargetNPCState[];

    guidedMissiles.value = data.filter(
      (i) => i.type === "guided-missile"
    ) as GuidedMissileState[];

    aas.value = data.filter((i) => i.type === "aa") as AAState[];
  });

  core.addAA({
    id: "aa-01",
    position: { x: 100, y: 200, z: 50 },
    type: "guided-missile",
    ammoCount: 16,
    radarProps: {},
    ammoProps: {
      activeRange: 6000,
      maxRange: 10000,
      minRange: 100,
      killRadius: 10,
      maxOverload: 1000,
      maxVelocity: 100,
    },
  });

  const myAA = computed(() => aas.value.find((i) => i.id === myAAId.value));

  function setMyAADirection(dAzimuth: number, dElevation: number) {
    if (!myAA.value) return;

    // Текущий вектор направления (aimRay)
    const { aimRay } = myAA.value;
    let direction = new THREE.Vector3(aimRay[0], aimRay[1], aimRay[2]);

    // Создаем кватернион для вращения по азимуту (вокруг оси Y)
    const azimuthQuat = new THREE.Quaternion();
    azimuthQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -dAzimuth);

    // Создаем кватернион для вращения по углу возвышения (вокруг оси X)
    const elevationQuat = new THREE.Quaternion();
    elevationQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -dElevation);

    // Применяем к вектору оба вращения
    direction.applyQuaternion(azimuthQuat);
    direction.applyQuaternion(elevationQuat);

    // Нормализуем вектор направления
    direction.normalize();

    core.eventEmitter.emit("update_aa_aim_ray", {
      aaId: myAAId.value,
      aimRay: [direction.x, direction.y, direction.z],
    });
  }

  function fire() {
    core.eventEmitter.emit("fire_aa", {
      aaId: myAAId.value,
    });
  }

  return {
    spheres,
    targetNPCs,
    guidedMissiles,
    aas,
    fire,
    setMyAADirection,
  };
});
