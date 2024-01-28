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
	constructor(foodObjType, scaleFactor) {
		super();
		this.foodType = foodObjType;
		this.scaleVal = scaleFactor;
		this.modelUrl = applePath;
	}
  
	loadToScene(loader, scene) {
		const self = this;
		loader.load( self.modelUrl, gltf => {
			self.add(gltf.scene);
			self.setScale(self.scaleVal)
			scene.add(self);
		} );
	}
	
	setPosition(posX, posY, posZ) {
		this.position.set(posX, posY, posZ);
	}

	setScale(scaleVal) {
		this.scale.set(scaleVal, scaleVal, scaleVal);

		// create bounding box for collision detection
		this.bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		this.bb.setFromObject(this);
	}

	rotate(speed) {
		this.rotation.x += 0.001 * speed;
		this.rotation.z += 0.001 * speed;
	}

	dispose() {
		this.bb = null;
		this.geometry.dispose();
		this.material.dispose();
	}
}


