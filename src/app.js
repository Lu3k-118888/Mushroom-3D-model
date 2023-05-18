import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as dat from 'lil-gui'
import gsap from 'gsap'


import fragment from './shaders/frag.glsl';
import vertex from './shaders/vert.glsl';


const gui = new dat.GUI()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const sizes  = {
	width: window.innerWidth,
	height: window.innerHeight
}
const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 100 );
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha: true
});


scene.add(camera)
camera.position.z = 1;

// Controls
const controls = new OrbitControls(camera,canvas);
controls.enableDamping = true;
controls.enabled = false;
gui.add(controls,'enabled').name('Orbit Controls')


const cubeTextureLoader = new THREE.CubeTextureLoader()
const envMapTex = cubeTextureLoader.load([
	'/assets/cube-map/px.png',
	'/assets/cube-map/nx.png',
	'/assets/cube-map/py.png',
	'/assets/cube-map/ny.png',
	'/assets/cube-map/pz.png',
	'/assets/cube-map/nz.png'
]);


// Lights   
const light2 = new THREE.DirectionalLight(0xffffff)
scene.add(light2)
light2.castShadow = true
const light3 = new THREE.AmbientLight()
scene.add(light3)
light2.intensity = 2.1


// GLTF
//  MODEL
const draco = new DRACOLoader();
draco.setDecoderPath('/draco/')
const mushroomLoader = new GLTFLoader()
mushroomLoader.setDRACOLoader(draco)

let mixer = null
mushroomLoader.load('/assets/model/mushroom.gltf',
(gltf)=>{
	// mixer = new THREE.AnimationMixer(gltf.scene)
	  
	scene.add(gltf.scene)
	gltf.scene.position.set(0,0,-3)
	gltf.scene.castShadow = true;
	gltf.scene.envMap = envMapTex;
	gltf.scene.envMapIntensity = .4;
	gltf.scene.traverse( function( child ) { if ( child instanceof THREE.Mesh ) { child.castShadow = true; } } );
	gltf.scene.position.set(0,-1.65,-5)
	gltf.scene.rotation.set(0,-.9,0)
	
})

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap
document.body.appendChild( renderer.domElement );

renderer.render( scene, camera );

// Event Listeners 
window.addEventListener('resize', () =>{
	// update sizes
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	// update camera
	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	// update render
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
window.addEventListener('dblclick', () => {
	const fullscreenElement = document.fullscreenElement || document.webkitfullscreenElement
	if(!fullscreenElement){
		if(canvas.requestFullscreen){
			canvas.requestFullscreen()
		}
		else if (canvas.webkitfullscreen){
			canvas.webkitRequestfullscreen()
		}
	}else{
		if(document.exitFullscreen){
			document.exitFullscreen()
		}else if(document.exitFullscreen){
			document.exitFullscreen()
		}
	}
})


const clock = new THREE.Clock()
const cursor = {
	x: 0,
	y: 0
}
window.addEventListener('mousemove',(event) => {
	cursor.x = event.clientX / sizes.width - .5
	cursor.y = - (event.clientY / sizes.height - .5)
})
const tick = () => {
	const elapsedtime = clock.getElapsedTime()

	
	// Update controls
	controls.update()
	renderer.render(scene,camera)
	window.requestAnimationFrame(tick)
}
tick();


