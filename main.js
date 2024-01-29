import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import InputHandler from '/InputHandler.js';
import {FoodObject, FoodType, PlanetObject, PlanetType } from './GameObjects';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);
const textureLoader = new THREE.TextureLoader(manager);
const inputMng = new InputHandler(document);

var startGameBtn = document.getElementById('startGameBtn');
var startTxt = document.getElementById('startTxt');
var scoreTxt = document.getElementById('scoreTxt');
var cargoScoreTxt = document.getElementById('cargoScoreTxt');
var deliveryListPanel = document.getElementById('deliveryListPanel');
var deliveryList = document.getElementById('deliveryList');
var deliveryListDone = document.getElementById('deliveryListDone');
var nextLevelBtn = document.getElementById('nextLevelBtn');
var startSkipped = false;

// Resources
const shipAssetPath = '/assets/strawberry_milk_delivery_spaceship/scene.gltf';
const skyBoxPath = '/assets/skybox_space_nebula/scene.gltf';
const collectAudio = new Audio('/audio/collect_001.ogg');
const openListAudio = new Audio('/audio/list_open_006.ogg');
const closeListAudio = new Audio('/audio/list_close_006.ogg');

// Values
const skyBoxScale = 100;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const shipScaleFactor = 0.05;
const shipGlideFactor = 0.025;
const shipAcc = 100.0;
const cargoDistace = 100.0;
const cameraOffset = new THREE.Vector3(0.0, 1.5 / shipScaleFactor, 5.0 / shipScaleFactor);
let prevTime = performance.now();
let foodCount = 1;
let planetCount = 8;

// Objects in the scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, skyBoxScale * 1000 );
const light = new THREE.HemisphereLight( 0xf0e0d0, 0x000000, 5);
let spaceShip;
let skyBox;
let planetList = [];
let foodList = [];
let foodDeliveryList = [];
let collectedFoodNames = [];

// scores
var collectedItemCount = 0;
var deliveredCargoCount = -1;
var ListedItemCount = 0;

var i = 0;
var txt = 	`Year 2150, people travelled through space and settled in colonies. \n
			It\'s all nice and tidy except one thing: they miss the authentic food! \n
			As the FoodRocket Delivery Service, this epic task is yours to fulfill now. \n
			Get your grocery list, collect all the items and deliver them to the people in space. \n
			Ready to be a cargo hero?`;
var typeWriterSpeed = 10; /* The speed/duration of the effect in milliseconds */

// Configurations
document.body.appendChild( renderer.domElement );

typeWriter();

function typeWriter() {
	if (i < txt.length && !startSkipped) {
		startTxt.innerHTML += txt.charAt(i);
		i++;
		// careful! Recursive function
		setTimeout(typeWriter, typeWriterSpeed);
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

startTxt.onclick = (event) => {
	startSkipped = true;
};

startGameBtn.addEventListener("click", startGame);
nextLevelBtn.addEventListener("click", generateLevel);

function startGame()
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
		skyBox.scale.set(skyBoxScale, skyBoxScale, skyBoxScale);
		logModelSize(skyBox);
		scene.add( skyBox );
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );

	// add planets
	planetList = [];
	for (let index = 0; index < planetCount; index++) {
		var volume = 50 * (index + 1);

		var planetType = index % planetCount + 1;
		
		var alternateX = ((index % 2) === 0) ? -1 : 1;

		var posX = alternateX * volume * 2 * (index + 1);
		var posZ = -1 * volume * 20;
		var pos = new THREE.Vector3(posX, -volume - cargoDistace, posZ);

		var planet = new PlanetObject(planetType, volume);
		planet.setPosition(pos);
		planet.loadToScene(textureLoader, scene);
		planetList.push(planet);
	}

	for (let index = 0; index < planetList.length; index++) {
		var foodType = index % 8 + 1;

		var food;
		switch(foodType)
		{
			case 1:
				food = new FoodObject(FoodType.Apple, 100);
				break;
			case 2:
				food = new FoodObject(FoodType.Pie, 100);
				break;
			case 3:
				food = new FoodObject(FoodType.Fries, 100);
				break;
			case 4:
				food = new FoodObject(FoodType.Burger, 100);
				break;
			case 5:
				food = new FoodObject(FoodType.Meatballs, 100);
				break;
			case 6:
				food = new FoodObject(FoodType.Cocktail, 100);
				break;
			case 7:
				food = new FoodObject(FoodType.Chili, 100);
				break;
			case 8:
				food = new FoodObject(FoodType.Noodle, 100);
				break;
			default:
				break;
		};

		const planetPos = planetList[index].position;
		var itemPosition = new THREE.Vector3(planetPos.x, 0, planetPos.z);

		food.setPosition(itemPosition);
		food.loadToScene(loader, scene);
		foodList.push(food);
	}

	generateLevel();
};

function generateLevel()
{
	nextLevelBtn.style.visibility="hidden";
	collectedItemCount = 0;
	collectedFoodNames = [];

	// clear scene
	foodList.forEach(food => {
		food.enableBoundingBox();
	});

	// generate shopping list
	let shuffledList = foodList.map((item) => item);
	shuffle(shuffledList);

	foodDeliveryList = [];
	for (let index = 0; index < foodCount; index++) {
		foodDeliveryList.push(shuffledList[index].foodType);
	}
	ListedItemCount = foodDeliveryList.length;

	if(foodCount < foodList.length){
		++foodCount;
	}
	++deliveredCargoCount;
	updateGameUi();
}

function shuffle(array){ 
	return array.sort(() => Math.random() - 0.5); 
}

manager.onLoad = function ( ) {

	updateGameUi();

	startGameBtn.style.visibility="hidden";
	deliveryListPanel.style.visibility="visible";
	scoreTxt.style.visibility="visible";
	cargoScoreTxt.style.visibility="visible";

	foodList.forEach(food => {
		food.enableBoundingBox();
	});

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

	var shipSpeed = inputMng.thrust ? shipAcc * 2.5 : shipAcc;

	if ( inputMng.moveForward || inputMng.moveBackward ) 
	{
		velocity.z -= direction.z * shipSpeed * delta;
	}

	if ( inputMng.moveLeft || inputMng.moveRight ) 
	{
		velocity.x += direction.x * shipSpeed * delta;
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

	// rotate the objects
	foodList.forEach(food => {
		food.rotate(10);
	});
	
	planetList.forEach(planet => {
		planet.rotate(1);
	});

	checkCollisions();

	prevTime = time;

	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.render( scene, camera );

	updateGameUi();
}

function checkCollisions()
{
	let spaceShipBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	spaceShipBB.setFromObject(spaceShip);

	foodList.forEach(food => {
		if(food.bb != null && spaceShipBB.intersectsBox(food.bb))
		{
			for (let index = 0; index < foodDeliveryList.length; index++) {
				const listItem = foodDeliveryList[index];
				if(food.foodType === listItem)
				{
					collectAudio.play();
					collectedFoodNames.push(food.foodType);
					++collectedItemCount;
		
					console.log(food.foodType, " is collected!");
		
					food.disableBoundingBox();

					const foodNameIndex = foodDeliveryList.findIndex((e) => e === food.foodType);
					foodDeliveryList.splice(foodNameIndex, 1);
					break;
				}
			}
		}
	});
}

function updateGameUi()
{
	scoreTxt.textContent = 	"Collected: " + collectedItemCount + "/" + ListedItemCount;
	cargoScoreTxt.textContent =	"Delivered: " + deliveredCargoCount;
	
	var listTxt = "";
	var doneListTxt = "";

	foodDeliveryList.forEach(food => {
		listTxt += "-" + food + "\n";
	});

	collectedFoodNames.forEach(foodName => {
		doneListTxt += "-" + foodName + "\n";
	});

	deliveryListDone.innerHTML = doneListTxt;
	deliveryList.innerHTML = listTxt;

	if(collectedItemCount === ListedItemCount)
	{
		scoreTxt.textContent = 	"All parcels are collected!";
		cargoScoreTxt.textContent =	"Delivered: " + deliveredCargoCount;
		nextLevelBtn.style.visibility="visible";
	}
}

function logModelSize(obj)
{
	const boundingBox = new THREE.Box3().setFromObject(obj);
	const modelSize = boundingBox.getSize(new THREE.Vector3());
	console.log(modelSize);
}
