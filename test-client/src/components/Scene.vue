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

        <!-- Террейн -->
        <Suspense>
            <GLTFModel path="/mars/scene.gltf" color="white" />
        </Suspense>


    </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ref, onMounted } from 'vue';
import { Core } from '../../../app/index'
import { OrbitControls, Cone, GLTFModel, Sphere } from '@tresjs/cientos'
import type { TargetNPCState } from '../../../app/entities/TargetNPC';

const sphereEntities = ref<{
    id: string,
    position: [number, number, number],
    quaternion: [number, number, number, number],
    radius: number;
    type: 'sphere'
}[]>([])

const targetNPCs = ref<TargetNPCState[]>([])

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
    })


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