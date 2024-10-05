

export class Creature {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    constructor(scene: Phaser.Scene, groundLayer: Phaser.Tilemaps.TilemapLayer, x: number, y: number) {
        // create the player sprite    
        this.sprite = scene.physics.add.sprite(x, y, 'creature');
        this.sprite.setBounce(0.2); // our player will bounce from items
        this.sprite.setCollideWorldBounds(true); // don't go out of the map
        scene.physics.add.collider(groundLayer, this.sprite); // ensure groundLayer is passed as an argument
    }

    update(isAction: boolean, x: number, y: number) {
        if (this.sprite.body.onFloor()) {
            const idle_jump = 250 + Phaser.Math.Between(-50, 0);
            const action_jump = 500 + Phaser.Math.Between(-50, 0);

            if (isAction) {
                const delta_x = x - this.sprite.x;
                const delta_y = y - this.sprite.y;
                const dist = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
                const coef_x = Math.min(1, idle_jump / dist);
                const coef_y = Math.min(1, action_jump / dist);
                this.sprite.body.setVelocity(delta_x * coef_x, Math.min(-idle_jump, delta_y * coef_y));
            }
            else {
                this.sprite.body.setVelocity(0, -idle_jump);            // jump up
            }
        }
    }
}
