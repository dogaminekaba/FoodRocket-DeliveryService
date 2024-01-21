export default class InputHandler{

	listOpenAudio = new Audio('/audio/list_open_006.ogg');

	constructor(doc){
		this.doc = doc;
		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;
		this.thrust = false; // TODO
		this.isMouseDown = false;
		this.mousePosX = 0.0;
		this.mousePosY = 0.0;

		doc.addEventListener( 'keydown', this.onKeyDown.bind(this) );
		doc.addEventListener( 'keyup', this.onKeyUp.bind(this) );
		doc.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this) );
		doc.addEventListener( 'mousedown', this.onDocumentMouseDown.bind(this) );
		doc.addEventListener( 'mouseup', this.onDocumentMouseUp.bind(this) );
	}

	onKeyDown ( event ) {
		switch ( event.code ) {

			case 'ArrowUp':
			case 'KeyW':
				this.moveForward = true;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				this.moveLeft = true;
				break;

			case 'ArrowDown':
			case 'KeyS':
				this.moveBackward = true;
				break;

			case 'ArrowRight':
			case 'KeyD':
				this.moveRight = true;
				break;

			case 'Space':
				this.thrust = true;
				this.listOpenAudio.play();
				break;
		}
	};

	onKeyUp ( event ) {

		switch ( event.code ) {

			case 'ArrowUp':
			case 'KeyW':
				this.moveForward = false;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				this.moveLeft = false;
				break;

			case 'ArrowDown':
			case 'KeyS':
				this.moveBackward = false;
				break;

			case 'ArrowRight':
			case 'KeyD':
				this.moveRight = false;
				break;

			case 'Space':
				this.thrust = false;
				break;
		}

	};

	onDocumentMouseMove ( event ) {

		event.preventDefault();
	
		if ( this.isMouseDown ) {
			this.mousePosX = event.clientX;
			this.mousePosY = event.clientY;
		}
	
	};

	onDocumentMouseDown ( event ) {

		event.preventDefault();

		this.isMouseDown = true;

		this.mousePosX = event.clientX;
		this.mousePosY = event.clientY;

	};

	onDocumentMouseUp ( event ) {

		event.preventDefault();

		this.isMouseDown = false;

		this.mousePosX = event.clientX - this.mousePosX;
		this.mousePosY = event.clientY - this.mousePosY;
	};

}