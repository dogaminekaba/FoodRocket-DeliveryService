import * as THREE from 'three';

const applePath = '/Assets/kenney_food-kit/Models/apple.gltf';

export const FoodType = {
	Apple: "Apple",
	Pie: "Pie",
	DonutSprinkles: "Sprinkled Donut",
	Fries: "Fries",
	Burger: "Burger",
	PlateDinner: "Swedish Meatballs",
	Cocktail: "Malibu Sunset",
	Pepper: "Chili",
	Broccoli: "Broccoli",
	ChineseNoodle: "Noodle Box"
}

export default class FoodObject extends THREE.Group {
	constructor(foodObjType) {
		super();
		this.foodType = foodObjType;
		this.modelUrl = applePath;
	}
  
	loadToScene(loader, scene) {
		const self = this;
		loader.load( self.modelUrl, gltf => {
			self.add(gltf.scene);
			scene.add(self);
		} );
	}
	
	setPosition(posX, posY, posZ) {
		this.position.set(posX, posY, posZ);
	}

	setScale(scaleVal) {
		this.scale.set(scaleVal, scaleVal, scaleVal);
	}

	rotate(speed) {
		this.rotation.x += 0.001 * speed;
		this.rotation.z += 0.001 * speed;
	}

	dispose() {
	  // Dispose everything that was created in this class - GLTF model, materials etc.
	}
}


