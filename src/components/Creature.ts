
export class Creature {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    constructor(scene: Phaser.Scene, groundLayer: Phaser.Tilemaps.TilemapLayer, x: number, y: number) {
        // create the player sprite    
        this.sprite = scene.physics.add.sprite(x, y, 'creature');
        this.sprite.setBounce(0.2); // our player will bounce from items
        this.sprite.setCollideWorldBounds(true); // don't go out of the map
        scene.physics.add.collider(groundLayer, this.sprite); // ensure groundLayer is passed as an argument

        // groundLayer.setTileIndexCallback([2, 14], this.collisionPlatform, this);
    }

    update() {
        if (this.sprite.body.onFloor()) {
            this.collisionPlatform();
        }
    }

    collisionPlatform() {
        this.sprite.body.setVelocityY(-200 + Phaser.Math.Between(-50, 0));            // jump up
    }
}
