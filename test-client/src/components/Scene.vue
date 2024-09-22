<template>
    <TresCanvas window-size clearColor="white">
        <!-- Камера -->
        <TresPerspectiveCamera :position="[0, 300, -500]" :fov="75" :near="0.1" :far="10000" />
        <!-- Орбитальные контроллеры -->
        <orbit-controls :enable-damping="true" :damping-factor="0.05" />

        <!-- Освещение -->
        <TresAmbientLight :intensity="0.6" />
        <TresDirectionalLight :position="[50, 500, 50]" />

        <!-- Сетка и оси -->
        <TresGridHelper :args="[1000]" />
        <TresAxesHelper :args="[100]" />

        <Cone :args="[5, 10, 32]" :rotation="[0, 0, -Math.PI / 2]" color="yellow" />

        <Sphere v-for="sphere in sphereEntities" :args="[sphere.radius]" :position="sphere.position"
            :quaternion="sphere.quaternion" :key="sphere.id" color="red" />

        <TresGroup v-for="npc in targetNPCs" :position="npc.position" :quaternion="npc.quaternion" :key="npc.id">
            <Cone :args="[npc.size / 3, npc.size, 32]" color="yellow" :rotation="[0, 0, -Math.PI / 2]" />
        </TresGroup>

        <TresGroup v-for="gm in guidedMissiles" :position="gm.position" :quaternion="gm.quaternion" :key="gm.id">
            <Cone :args="[2, 6, 32]" color="orange" :rotation="[0, 0, -Math.PI / 2]" />
        </TresGroup>

        <TresGroup v-for="aa in aas" :position="aa.position" :key="aa.id">
            <Cone :args="[2, 5, 32]" color="red" />
            <Line2 :points="[
                [0, 0, 0],
                [
                    (aa.aimRay[0] || 1) * 100,
                    (aa.aimRay[1] || 1) * 100,
                    (aa.aimRay[2] || 1) * 100
                ]
            ]" color="green" linewidth="5" />
        </TresGroup>

        <!-- Террейн -->
        <Suspense>
            <GLTFModel path="/mars/scene.gltf" color="white" />
        </Suspense>


    </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ref, onMounted, reactive } from 'vue';
import { Core } from '../../../app/index'
import { OrbitControls, Cone, GLTFModel, Sphere, Line2 } from '@tresjs/cientos'
import type { TargetNPCState } from '../../../app/entities/TargetNPC';
import type { AAState } from '../../../app/entities/AA';
import type { GuidedMissileState } from '../../../app/entities/GuidedMissile';

const sphereEntities = ref<{
    id: string,
    position: [number, number, number],
    quaternion: [number, number, number, number],
    radius: number;
    type: 'sphere'
}[]>([])

const targetNPCs = ref<TargetNPCState[]>([])
const guidedMissiles = ref<GuidedMissileState[]>([])
const aas = ref<AAState[]>([])

const aaId = 'aa-01';
const aimRay = reactive({ x: 0, y: 0, z: 0 })

function normalizeVector(x: number, y: number, z: number) {
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length === 0) return { x: 0, y: 0, z: 0 };
    return { x: x / length, y: y / length, z: z / length };
}

async function initCore() {

    const core = new Core({
        heightmapTerrain: {
            data: [
                [0, 0],
                [0, 0]
            ],
            width: 8000,
            height: 8000
        },
        targetNPCs: [
            {
                id: 'test-1',
                rcs: 100,
                temperature: 20,
                size: 10,
                waypoints: [
                    {
                        speed: 50,
                        position: { x: 0, y: 200, z: 0 }
                    },
                    {
                        speed: 50,
                        position: { x: 500, y: 200, z: 0 }
                    },
                    {
                        speed: 50,
                        position: { x: 500, y: 200, z: 500 }
                    }
                ]
            }
        ]
    })

    // setTimeout(() => core.collisionTest(), 2000)
    core.eventEmitter.on('update_world_state', (data) => {
        sphereEntities.value = data.filter(i => i.type === 'sphere') as any[]
        targetNPCs.value = data.filter(i => i.type === 'target-npc') as TargetNPCState[]
        guidedMissiles.value = data.filter(i => i.type === 'guided-missile') as GuidedMissileState[]
        aas.value = data.filter(i => i.type === 'aa') as AAState[]
    })

    core.addAA({
        id: 'aa-01',
        position: { x: 100, y: 200, z: 50 },
        type: 'guided-missile',
        ammoCount: 16,
        radarProps: {},
        ammoProps: {
            activeRange: 6000,
            maxRange: 10000,
            minRange: 100,
            killRadius: 10,
            maxOverload: 1000,
            maxVelocity: 100,
        }
    })

    function handleKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case ' ':
                fireMissile();
                return;
        }
        const normalizedAimRay = normalizeVector(aimRay.x, aimRay.y, aimRay.z);
        core.eventEmitter.emit('update_aa_aim_ray', { aaId: 'aa-01', aimRay: [normalizedAimRay.x, normalizedAimRay.y, normalizedAimRay.z] });

    }

    // Функция для стрельбы (пробел)
    function fireMissile() {
        console.log("Fire missile");
        core.eventEmitter.emit('fire_aa', { aaId });
    }
    window.addEventListener('keydown', handleKeydown);
}




onMounted(() => {
    initCore();

})
</script>

<style scoped>
canvas {
    display: block;
}
</style>