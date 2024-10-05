
export class Player {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    isAction: boolean = false;

    constructor(scene: Phaser.Scene, groundLayer: Phaser.Tilemaps.TilemapLayer, x: number, y: number) {
        // create the player sprite    
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setBounce(0.2); // our player will bounce from items
        this.sprite.setCollideWorldBounds(true); // don't go out of the map
        scene.physics.add.collider(groundLayer, this.sprite);

        scene.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNames('player', { prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = scene.input.keyboard?.createCursorKeys();
    }

    update() {
        const moveLeft = this.cursors ? this.cursors.left.isDown : false;
        const moveRight = this.cursors ? this.cursors.right.isDown : false;
        const moveUp = this.cursors ? this.cursors.up.isDown : false;
        const isAction = this.cursors ? this.cursors.space.isDown : false;

        if (moveLeft) {
            this.sprite.body.setVelocityX(-200);            // move left
            this.sprite.anims.play('walk', true);           // play walk animation
            this.sprite.flipX = true;                       // flip the sprite to the left
        }
        else if (moveRight) {
            this.sprite.body.setVelocityX(200);             // move right
            this.sprite.anims.play('walk', true);           // play walk animatio
            this.sprite.flipX = false;                      // use the original sprite looking to the right
        }
        else {
            this.sprite.body.setVelocityX(0);
            this.sprite.anims.stop();
            this.sprite.setFrame(0);                          // set the player's frame to 0 (stand still)
        }

        if (moveUp && this.sprite.body.onFloor()) {
            this.sprite.body.setVelocityY(-500);            // jump up
        }

        this.isAction = isAction;
    }
}
