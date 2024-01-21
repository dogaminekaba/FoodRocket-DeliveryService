import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import InputHandler from '/InputHandler.js';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);
const textureLoader = new THREE.TextureLoader(manager);
const inputMng = new InputHandler(document);

let composer, outlinePass;

// Paths
const shipAssetPath = '/Assets/strawberry_milk_delivery_spaceship/scene.gltf';
const skyBoxPath = '/Assets/skybox_space_nebula/scene.gltf';
const applePath = '/Assets/kenney_food-kit/Models/apple.gltf';

const earthTexturePath = '/Assets/planets/textures/earth.jpg';
const planet2TexturePath = '/Assets/planets/textures/2k_venus_surface.jpg';

// Objects in the scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
const light = new THREE.HemisphereLight( 0xf0e0d0, 0x000000, 5);
let spaceShip;
let skyBox;
let apple;
let pl1;
let pl2;

// Other variables
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const shipScaleFactor = 0.05;
const shipGlideFactor = 0.025;
let shipMass = 100.0;
const shipAcc = 100.0;
let gravity = 9.8;
var cargoDistace = 50.0;
const cameraOffset = new THREE.Vector3(0.0, 1.5 / shipScaleFactor, 5.0 / shipScaleFactor);

// const axesHelper = new THREE.AxesHelper( 100 );
// axesHelper.position.set(10,10,10);
// scene.add( axesHelper );

// Configurations
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

init();

function init()
{
	scene.add( light );

	// add spaceship to scene
	loader.load( shipAssetPath, function ( gltf ) {

		spaceShip = gltf.scene;
		spaceShip.position.z = 10;
		spaceShip.scale.set(shipScaleFactor,shipScaleFactor,shipScaleFactor);
		spaceShip.rotation.x = Math.PI / 8;
		spaceShip.rotation.y = Math.PI;
	
		scene.add( spaceShip );
		
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );

	// add skybox to scene
	loader.load( skyBoxPath, function ( gltf ) {

		skyBox = gltf.scene;
		skyBox.scale.set(5,5,5);

		logModelSize(skyBox);

		scene.add( skyBox );
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );

	// add planets
	textureLoader.load( earthTexturePath, function ( texture ) {

		var volume = 50;
		var geometry = new THREE.SphereGeometry( volume );

		var material = new THREE.MeshBasicMaterial( { map: texture } );
		pl1 = new THREE.Mesh( geometry, material );

		pl1.position.set(-50, -volume - cargoDistace, -1000);
		
		scene.add( pl1 );

	} );

	textureLoader.load( planet2TexturePath, function ( texture ) {

		var volume = 100;
		var geometry = new THREE.SphereGeometry( volume );

		var material = new THREE.MeshLambertMaterial( { map: texture } );
		pl2 = new THREE.Mesh( geometry, material );

		pl2.position.set(1000, -volume - cargoDistace, -1000);
		
		scene.add( pl2 );

	} );

	// add cargos
	loader.load( applePath, function ( gltf ) {

		apple = gltf.scene;
		apple.scale.set(100,100,100);
		logModelSize(apple);

		apple.position.set(1000, 0, -1000);

		scene.add( apple );
		
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );


};

manager.onLoad = function ( ) {
	console.log( 'Loading complete!');

	// call animate here to avoid rendering scene before loading assets
	animate();
};

function animate() {
	requestAnimationFrame(animate);

	var shipGlideAngle = 0;
	
	const time = performance.now();
	const delta = ( time - prevTime ) / 1000;

	velocity.x -= velocity.x * 10.0 * delta;
	velocity.z -= velocity.z * 10.0 * delta;

	direction.z = Number( inputMng.moveForward ) - Number( inputMng.moveBackward );
	direction.x = Number( inputMng.moveRight ) - Number( inputMng.moveLeft );
	direction.normalize(); // this ensures consistent movements in all directions

	if ( inputMng.moveForward || inputMng.moveBackward ) 
	{
		velocity.z -= direction.z * shipAcc * delta;
	}

	if ( inputMng.moveLeft || inputMng.moveRight ) 
	{
		velocity.x += direction.x * shipAcc * delta;
		shipGlideAngle = velocity.x * shipGlideFactor;
	}
	else
	{
		shipGlideAngle = 0;
	}	

	// glide the ship
	spaceShip.rotation.z = shipGlideAngle;

	// move spaceship
	spaceShip.position.x += velocity.x;
	spaceShip.position.z += velocity.z;
	
	// update respective objects' positions
	skyBox.position.copy(spaceShip.position);
	camera.position.copy(spaceShip.position).add(cameraOffset);

	// rotate the collectables
	apple.rotation.x += 0.01;
	apple.rotation.y += 0.01;
	
	pl1.rotation.x += 0.001;
	pl1.rotation.z += 0.001;

	pl2.rotation.x += 0.001;
	pl2.rotation.y += 0.001;

	prevTime = time;

	renderer.render( scene, camera );
}

function logModelSize(obj)
{
	const boundingBox = new THREE.Box3().setFromObject(obj);
	const modelSize = boundingBox.getSize(new THREE.Vector3());
	console.log(modelSize);
}

