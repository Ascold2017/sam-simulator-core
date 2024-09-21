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

        <!-- Террейн -->
        <Suspense>
            <GLTFModel path="/mars/scene.gltf" color="white"/>
        </Suspense>


    </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ref, onMounted } from 'vue';
import { Core } from '../../../app/index'
import { OrbitControls, Cone, GLTFModel, Sphere } from '@tresjs/cientos'

const sphereEntities = ref<{
    id: string,
    position: [number, number, number],
    quaternion: [number, number, number, number],
    radius: number;
    type: 'shere'
}[]>([])

async function initCore() {

    const core = new Core({
        heightmapTerrain: {
            data: [
                [0, 0],
                [0, 0]
            ],
            width: 8000,
            height: 8000
        }
    })

    setTimeout(() => core.collisionTest(), 2000)
    core.eventEmitter.addListener('update_world_state', (data) => {
        sphereEntities.value = data.filter(i => i.type === 'sphere')
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