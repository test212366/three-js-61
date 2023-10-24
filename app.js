import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'



const colors = require('nice-color-palettes')

let palette = colors[Math.floor(Math.random() * 100)]
export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0x000000, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 1000
		)
 
		this.camera.position.set(0, 0, 6) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0
		this.localtime = 0

		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true

		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()

 
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 853/1280
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				resolution: {value: new THREE.Vector4()},
				color: {value: new THREE.Color('#000000')},
				offset: {value: 0}
			},
			vertexShader,
			fragmentShader
		})
		this.animated = []
		function range(min, max) {
			return min + Math.random() * (max - min)
		}

		this.number = 220

		this.scene.rotation.z = Math.PI / 9
		for (let i = 0; i < this.number; i++) {
			let precision = 100
			
			let spline = []
			let level = range(-300, 300)
			let zero = (level) / 300
			// let rad = 130 * (Math.sin(zero * 4) + Math.sin(zero * 10)) + Math.random() * 10
			
			let rad = 130 * zero + Math.random() * 10
			
			let offset = Math.abs(zero)
			let angle = range(0, 2 * Math.PI)
			let width = Math.random() * 0.5 + 0.5

			let center = {
				x: range(-10, 10),
				y: range(-10, 10)
			}

			for (let j = 0; j <= precision * width; j++) {
				let x = range(-10, 10) + zero +  rad * Math.sin(Math.PI * 2 * j / precision)
				let z =  range(-10, 10) + zero +  rad * Math.cos(Math.PI * 2 * j / precision)
				spline.push(
					new THREE.Vector3(x, level, z)
				)
				
			}

			let sampleClosedSpline = new THREE.CatmullRomCurve3(spline)

			const params = {
				scale: 4,
				extrusionSegments: 100,
				radiusSegments: 16,
				closed: false
			}

			let TubeGeometry = new THREE.TubeGeometry(sampleClosedSpline, params.extrusionSegments, 0.5, params.radiusSegments, params.closed)
			let TubeGeometry1 = new THREE.TubeGeometry(sampleClosedSpline, params.extrusionSegments, 0.5 + 0.5, params.radiusSegments, params.closed)
			
			
			let m  = this.material.clone()
			let m1  = this.material.clone()
			m.uniforms.color.value = new THREE.Color('#ffffff')
			// m.uniforms.color.value = new THREE.Color(palette[Math.floor(Math.random() * 5)])

			m.uniforms.offset.value = offset
			m1.uniforms.offset.value = offset

			m1.side = THREE.BackSide

			let mesh = new THREE.Mesh(TubeGeometry, m)
			let mesh1 = new THREE.Mesh(TubeGeometry1, m1)

			mesh.scale.set(0.01, 0.01,0.01)
			mesh1.scale.set(0.01, 0.01,0.01)

			mesh.rotation.y = mesh1.rotation.y = angle

			this.scene.add(mesh)
			this.scene.add(mesh1)

			this.animated.push({
				mesh,
				material: m,
				material1: m1

			})
			
		}
		

		// function CustomSinCurve(scale) {
		// 	THREE.Curve.call(this)
		// 	this.scale = (scale === undefined) ? 1 : scale
		// }

		// CustomSinCurve.prototype = Object.create(THREE.Curve.prototype)
		// CustomSinCurve.prototype.construtor = CustomSinCurve
		// CustomSinCurve.prototype.getPoint = function(t) {
		// 	const tx = t * 3 - 1.5
		// 	const ty = Math.sin(2 * Math.PI * t)
		// 	const tz = 0

		// 	return  new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale)
		// }

		// const path = new CustomSinCurve(10)
		// this.geometry = new THREE.TubeGeometry(path, 20, 2, 8, false)
		


 
		// this.plane = new THREE.Mesh(this.geometry, this.material)
 
		// this.scene.add(this.plane)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		// this.material.uniforms.time.value = this.time
		 
		this.localtime += 0.05

		if(this.localtime >= 10.0) this.localtime = 0
		
		this.animated.forEach(o => {

			o.material.uniforms.time.value = this.localtime
			o.material1.uniforms.time.value = this.localtime

		
		})
		//this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 