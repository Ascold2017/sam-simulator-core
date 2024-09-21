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
        <Suspense v-if="terrainEntity">
            <GLTFModel path="/mars/scene.gltf" color="white"/>
        </Suspense>


    </TresCanvas>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { missionData } from '@/assets/missionData'
import { TresCanvas } from '@tresjs/core'
import { ref, onMounted } from 'vue';
import { Core } from '../../../app/index'
import { OrbitControls, Cone, GLTFModel, Sphere } from '@tresjs/cientos'
import { Mesh, BufferGeometry, Material, PlaneGeometry, SphereGeometry, CylinderGeometry, BoxGeometry, MeshStandardMaterial } from 'three';

const flightObjects = ref<FlightObjectDTO[]>([]);
const sphereEntities = ref<{
    id: string,
    position: [number, number, number],
    quaternion: [number, number, number, number],
    radius: number;
    type: 'shere'
}[]>([])
const terrainEntity = ref<{
    id: string,
    position: [number, number, number],
    quaternion: [number, number, number, number]
} | null>(null)

async function initCore() {
    const base64Image = await getBase64FromUrl('/mars/textures/heightmap.png') as string;

    const core = new Core({
        heightmapTerrain: {
            base64Image,
            minHeight: 650.476318359375,
            maxHeight: 1318.1937255859375,
            width: 8000,
            height: 8000
        }
    })

    setTimeout(() => core.collisionTest(), 2000)
    core.eventEmitter.addListener('update_world_state', (data) => {
        sphereEntities.value = data.filter(i => i.type === 'sphere')
        terrainEntity.value = data.find(i => i.type === 'heightmap')
    })


}

async function getBase64FromUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
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