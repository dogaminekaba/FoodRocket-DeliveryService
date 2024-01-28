import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import InputHandler from '/InputHandler.js';
import FoodObject from './GameObjects';
import FoodType from './GameObjects';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);
const textureLoader = new THREE.TextureLoader(manager);
const inputMng = new InputHandler(document);

var startGameBtn = document.getElementById('startGameBtn');
var startTxt = document.getElementById('startTxt');
var scoreTxt = document.getElementById('scoreTxt');
var startSkipped = false;

startTxt.onclick = (event) => {
	startSkipped = true;
};

// Paths
const shipAssetPath = '/Assets/strawberry_milk_delivery_spaceship/scene.gltf';
const skyBoxPath = '/Assets/skybox_space_nebula/scene.gltf';

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

// scores
var collectedItemCount = 0;
var deliveredItemCount = 0;
var ListedItemCount = 10;

var i = 0;
var txt = 	`Year 2150, people travelled through space and settled in colonies. \n
			It\'s all nice and tidy except one thing: they miss the authentic food! \n
			As the FoodRocket Delivery Service, this epic task is yours to fulfill now. \n
			Get your grocery list, collect all the items and deliver them to the people in space. \n
			Ready to be a cargo hero?`;
var speed = 10; /* The speed/duration of the effect in milliseconds */


// const axesHelper = new THREE.AxesHelper( 100 );
// axesHelper.position.set(10,10,10);
// scene.add( axesHelper );

// Configurations
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

typeWriter();

function typeWriter() {
	if (i < txt.length && !startSkipped) {
		startTxt.innerHTML += txt.charAt(i);
		i++;
		// careful! Recursive function
		setTimeout(typeWriter, speed);
	}
	else
	{
		if(startSkipped)
		{
			startTxt.innerHTML = txt;
		}

		console.log("typeWriter ended");
	}
}

startGameBtn.onclick = function startGame()
{
	console.log("started");

	startSkipped = true;
	startTxt.style.visibility="hidden";
	startGameBtn.setAttribute('disabled', true);
	startGameBtn.textContent = "Loading...";

	scene.add( light );

	// add spaceship to scene
	loader.load( shipAssetPath, function ( gltf ) {

		console.log("spaceship");
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

		console.log("skybox");
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
	apple = new FoodObject(FoodType.Apple, 100);
	apple.setPosition(1000, 0, -1000);
	apple.loadToScene(loader, scene);

};

manager.onLoad = function ( ) {
	startGameBtn.style.visibility="hidden";

	scoreTxt.textContent = "Collected: " + collectedItemCount + "/" + ListedItemCount;
	scoreTxt.style.visibility="visible";

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
	if(apple != null) {
		apple.rotate(10);
	}
	
	pl1.rotation.x += 0.001;
	pl1.rotation.z += 0.001;

	pl2.rotation.x += 0.001;
	pl2.rotation.y += 0.001;

	checkCollisions();

	prevTime = time;

	renderer.render( scene, camera );

	scoreTxt.textContent = "Collected: " + collectedItemCount + "/" + ListedItemCount;
}

function checkCollisions()
{
	let spaceShipBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	spaceShipBB.setFromObject(spaceShip);

	if(apple.bb != null && spaceShipBB.intersectsBox(apple.bb))
	{
		++collectedItemCount;
		scene.remove(apple);
		apple.dispose();
	}
}

function logModelSize(obj)
{
	const boundingBox = new THREE.Box3().setFromObject(obj);
	const modelSize = boundingBox.getSize(new THREE.Vector3());
	console.log(modelSize);
}
