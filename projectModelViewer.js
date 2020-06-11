
import * as THREE from '/three.module.js';
import {OrbitControls} from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { VRButton } from '/VRButton.js';
let fetchPromise = fetch("model.3dm");

rhino3dm().then(async m => {
	console.log('Loaded rhino3dm.');
	let rhino = m;

	let res = await fetchPromise;
	let buffer = await res.arrayBuffer();
	let arr = new Uint8Array(buffer);
	let doc = rhino.File3dm.fromByteArray(arr);

	THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1)
	init();
	
	let objects = doc.objects();
	
	for (let i = 0; i < objects.count; i++) {
		let mesh = objects.get(i).geometry();
		let att = objects.get(i).attributes();
		
		var r = 255;
		var g = 0;
		var b = 127;
		
		if(att.layerIndex > -1) {
			var objColor = att.objectColor
			r = objColor.r/255;
			g = objColor.g/255;
			b = objColor.b/255;
		}
		
		var tempColour = new THREE.Color(r,g,b);
		
		if(mesh instanceof rhino.Mesh) {
			// convert all meshes in 3dm model into threejs objects

			let tempMat = new THREE.MeshStandardMaterial({
				opacity: 1,
				color: tempColour,
				emissive: 0xffffff,
				emissiveIntensity:0.2,
				roughness:0.5,
				side: THREE.DoubleSide,
				//wireframe: true,
				transparent:true,
				opacity:1.0
			});
			
			let threeMesh = meshToThreejs(mesh, tempMat);
			scene.add(threeMesh);
		}
	}
});

// BOILERPLATE //
var scene, camera, renderer, controls;

function init(){
	scene = new THREE.Scene();
	scene.background = new THREE.Color(1,1,1);
	camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 1000);
	camera.position.set(-25,-150,50);
	
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;

	var canvasSpace = document.getElementById('canvas');
	var canvasHeight = 550;
	
	if(canvasSpace.clientHeight>550){
		canvasHeight = canvasSpace.clientHeight;
	}
	
	console.log("canvasWidth set to"+canvasSpace.clientWidth);
	console.log("canvasHeight set to"+canvasHeight);
	
	renderer.setSize(canvasSpace.clientWidth, canvasHeight);
	camera.aspect = canvasSpace.clientWidth/canvasHeight;
	camera.updateProjectionMatrix();
	
	canvasSpace.appendChild(renderer.domElement);

	canvasSpace.appendChild(VRButton.createButton(renderer));
	
	var amb = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( amb );
	
	var hemi = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
	scene.add(hemi);
	
	controls = new OrbitControls(camera, renderer.domElement);
	controls.target = new THREE.Vector3(0.5,0.5,6);

	window.addEventListener( 'resize', onWindowResize, false );
	animate();
}

var animate = function () {
	renderer.setAnimationLoop( function () {
		renderer.render( scene, camera );
	} );
};

function onWindowResize() {
	var canvasSpace = document.getElementById('canvas');
	
	var renderCanvas = renderer.domElement;
	const height = renderCanvas.clientHeight;
	const width = renderCanvas.clientWidth;
	
	const newWidth = canvasSpace.clientWidth;
	const newHeight = canvasSpace.clientHeight;
	renderer.setSize( newWidth, newHeight);
	
	camera.aspect = newWidth/newHeight;
	camera.updateProjectionMatrix();
	console.log("views updated to "+newWidth+" x "+newHeight);
	
	animate();
}

function meshToThreejs(mesh, material) {
	let loader = new THREE.BufferGeometryLoader();
	var geometry = loader.parse(mesh.toThreejsJSON());
	return new THREE.Mesh(geometry, material);
}

function specialcolor(color) {
	var r = color.r/255;
	var g = color.g/255;
	var b = color.b/255;
	var tempMat = new THREE.MeshStandardMaterial({
				opacity: 1,
				color: new THREE.Color(r,g,b),
				//color: tempColour,
				//emissive: 0x0,
				roughness:0.8,
				side: THREE.DoubleSide
			});
	return tempMat;
}