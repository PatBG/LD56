import { InputManager } from "./InputManager";

export class Player {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    isAction = false;
    rangeAction= 0;
    readonly rangeActionMax = 300;
    graphics: Phaser.GameObjects.Graphics;
    scene: Phaser.Scene;
    inputManager: InputManager;

    constructor(scene: Phaser.Scene, groundLayer: Phaser.Tilemaps.TilemapLayer, layerUI: Phaser.GameObjects.Layer, x: number, y: number) {
        this.scene = scene;
        // create the player sprite    
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        //this.sprite.setCircle(this.sprite.width / 2);
        this.sprite.setBounce(0.2); // our player will bounce from items
        this.sprite.setCollideWorldBounds(true); // don't go out of the map
        scene.physics.add.collider(groundLayer, this.sprite);

        this.inputManager = new InputManager(scene, layerUI);

        // scene.anims.create({
        //     key: 'walk',
        //     frames: scene.anims.generateFrameNames('player', { prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2 }),
        //     frameRate: 10,
        //     repeat: -1
        // });

        this.graphics = scene.add.graphics();
    }
    update(_time: number, delta: number) {

        const input = this.inputManager.getInput(this.sprite.x, this.sprite.y);

        if (input.moveLeft) {
            this.sprite.body.setVelocityX(-200);            // move left
            // this.sprite.anims.play('walk', true);           // play walk animation
            this.sprite.flipX = true;                       // flip the sprite to the left
        }
        else if (input.moveRight) {
            this.sprite.body.setVelocityX(200);             // move right
            // this.sprite.anims.play('walk', true);           // play walk animatio
            this.sprite.flipX = false;                      // use the original sprite looking to the right
        }
        else {
            this.sprite.body.setVelocityX(0);
            this.sprite.anims.stop();
            this.sprite.setFrame(0);                          // set the player's frame to 0 (stand still)
        }

        if (this.sprite.body.onFloor()) {
            if (input.moveUp && this.sprite.body.onFloor()) {
                this.sprite.body.setVelocityY(-500);            // jump up
            }
            else {
                if (input.moveLeft || input.moveRight) {
                    // this.sprite.body.setVelocityY(-200);         // Uncomment to make the player jump while walking
                }
            }
        }

        this.isAction = input.isAction;
        this.graphics.clear();
        if (input.isAction) {
            if (this.rangeAction < this.rangeActionMax) {
                this.rangeAction = Math.min(this.rangeActionMax, this.rangeAction + 0.3 * delta);
            }
            this.graphics.fillStyle(0xff0000);
            this.graphics.alpha = 0.05;
            const circle = new Phaser.Geom.Circle(this.sprite.x, this.sprite.y, this.rangeAction);
            this.graphics.fillCircleShape(circle);
        }
        else {
            this.rangeAction = 0;
        }
    }

    IsInRangeForAction(x: number, y: number): boolean {
        const delta_x = x - this.sprite.x;
        const delta_y = y - this.sprite.y;
        const dist = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        return dist <= this.rangeAction;
    }
}
