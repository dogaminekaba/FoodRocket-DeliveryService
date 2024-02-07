import * as THREE from 'three';

const modelsPath = 'public/assets/kenney_food-kit/Models/';
const texturesPath = 'public/assets/planets/textures/';

const applePath = modelsPath + 'apple.gltf';
const piePath = modelsPath + 'pie.gltf';
const friesPath = modelsPath + 'fries.gltf';
const burgerPath = modelsPath + 'burger.gltf';
const meatballsPath = modelsPath + 'meatballs.gltf';
const cocktailPath = modelsPath + 'cocktail.gltf';
const chiliPath = modelsPath + 'chili.gltf';
const noodlePath = modelsPath + 'noodle.gltf';

const mercuryTexturePath = texturesPath + '2k_mercury.jpg';
const venusTexturePath = texturesPath + '2k_venus_surface.jpg';
const earthTexturePath = texturesPath + 'earth.jpg';
const marsTexturePath = texturesPath + '2k_mars.jpg';
const jupiterTexturePath = texturesPath + '2k_jupiter.jpg';
const saturnTexturePath = texturesPath + '2k_saturn.jpg';
const uranusTexturePath = texturesPath + '2k_uranus.jpg';
const neptuneTexturePath = texturesPath + '2k_neptune.jpg';

export const FoodType = {
	Apple: "Apple",
	Pie: "Pie",
	Fries: "Fries",
	Burger: "Burger",
	Meatballs: "Swedish Meatballs",
	Cocktail: "Cocktail",
	Chili: "Chili",
	Noodle: "Noodle Box"
}

export class FoodObject extends THREE.Group {
	constructor(foodObjType, scaleFactor) {
		super();
		this.foodType = foodObjType;
		this.scaleVal = scaleFactor;

		switch(foodObjType)
		{
			case FoodType.Apple:
				this.modelUrl = applePath;
				break;
			case FoodType.Pie:
				this.modelUrl = piePath;
				break;
			case FoodType.Fries:
				this.modelUrl = friesPath;
				break;
			case FoodType.Burger:
				this.modelUrl = burgerPath;
				break;
			case FoodType.Meatballs:
				this.modelUrl = meatballsPath;
				break;
			case FoodType.Cocktail:
				this.modelUrl = cocktailPath;
				break;
			case FoodType.Chili:
				this.modelUrl = chiliPath;
				break;
			case FoodType.Noodle:
				this.modelUrl = noodlePath;
				break;
			default:
				break;
		};
		
	}
  
	loadToScene(loader, scene) {
		const self = this;
		loader.load( self.modelUrl, gltf => {
			self.add(gltf.scene);
			self.setScale(self.scaleVal)
			scene.add(self);
		} );
	}
	
	setPosition(pos) {
		this.position.set(pos.x, pos.y, pos.z);
	}

	setScale(scaleVal) {
		this.scale.set(scaleVal, scaleVal, scaleVal);
	}

	enableBoundingBox()
	{
		this.visible = true;
		// create bounding box for collision detection
		this.bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		this.bb.setFromObject(this);
	}

	disableBoundingBox()
	{
		this.visible = false;
		this.bb = null;
	}

	rotate(speed) {
		this.rotation.x += 0.001 * speed;
		this.rotation.z += 0.001 * speed;
	}

	dispose() {

	}
}


export const PlanetType = {
	Earth: 'Earth',
	Venus: 'Venus',
	Moon: 'Moon'
}

export class PlanetObject extends THREE.Group {
	constructor(planetObjType, scaleFactor) {
		super();
		this.planetType = planetObjType;
		this.volume = scaleFactor;

		switch(planetObjType)
		{
			case 1:
				this.modelUrl = mercuryTexturePath;
				break;
			case 2:
				this.modelUrl = venusTexturePath;
				break;
			case 3:
				this.modelUrl = earthTexturePath;
				break;
			case 4:
				this.modelUrl = marsTexturePath;
				break;
			case 5:
				this.modelUrl = jupiterTexturePath;
				break;
			case 6:
				this.modelUrl = saturnTexturePath;
				break;
			case 7:
				this.modelUrl = uranusTexturePath;
				break;
			case 8:
				this.modelUrl = neptuneTexturePath;
				break;
			default:
				break;
		};
		
	}
  
	loadToScene(textureLoader, scene) {
		const self = this;
		textureLoader.load( self.modelUrl, function ( texture ) {
			
			self.geometry = new THREE.SphereGeometry( self.volume );
			self.material = new THREE.MeshBasicMaterial( { map: texture } );
			var planet = new THREE.Mesh( self.geometry, self.material );
	
			self.add(planet);
			scene.add(self);
	
		} );
	}
	
	setPosition(pos) {
		this.position.set(pos.x, pos.y, pos.z);
	}

	setScale(scaleVal) {
		this.scale.set(scaleVal, scaleVal, scaleVal);

		// create bounding box for collision detection
	}

	rotate(speed) {
		this.rotation.x += 0.001 * speed;
		this.rotation.z += 0.001 * speed;
	}

	dispose() {
		this.geometry.dispose();
		this.material.dispose();
	}
}
