
// You can write more code here

/* START OF COMPILED CODE */

class Level extends Phaser.Scene {
	
	constructor() {
		super("Level");
		
		/** @type {Phaser.GameObjects.TileSprite} */
		this.mountains;
		
		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}
	
	create() {
		
		// mountains
		const mountains = this.add.tileSprite(407, 221, 819, 231, "mountains");
		
		this.mountains = mountains;
	}
	
	/* START-USER-CODE */

	// Write your code here.
	update(){
		this.mountains.tilePositionX -= 1;
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
