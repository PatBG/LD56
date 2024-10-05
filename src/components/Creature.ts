
interface IsInRange {
    (x: number, y: number): boolean;
}

export class Creature {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    constructor(scene: Phaser.Scene, groundLayer: Phaser.Tilemaps.TilemapLayer, x: number, y: number) {
        // create the player sprite    
        this.sprite = scene.physics.add.sprite(x, y, 'creature');
        this.sprite.setBounce(0.2); // our player will bounce from items
        this.sprite.setCollideWorldBounds(true); // don't go out of the map
        scene.physics.add.collider(groundLayer, this.sprite); // ensure groundLayer is passed as an argument
    }

    update(isAction: boolean, isInRangeCallback: IsInRange, x: number, y: number) {
        const isInRange = isInRangeCallback(this.sprite.x, this.sprite.y);
        this.sprite.setFrame(isInRange ? 1 : 0);
        // If the creature is on the ground
        if (this.sprite.body.onFloor()) {
            const idle_jump = 200 + Phaser.Math.Between(50, 0);
            const magic_number_y = 2;
            const delta_top_of_target = -100;
            if (isInRange && isAction) {
                const action_jump = 550 + Phaser.Math.Between(50, 0);
                const delta_x = x - this.sprite.x;
                const delta_y = (y + delta_top_of_target) - this.sprite.y;
                const dist = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
                const coef_x = Math.min(1, idle_jump / dist);
                const coef_y = Math.min(1, action_jump / dist) * magic_number_y;
                const velocity_x = delta_x * coef_x;
                const velocity_y = Math.min(-idle_jump, delta_y * coef_y);
                this.sprite.body.setVelocity(velocity_x, velocity_y);
                console.log(`Jump to Player x=${x.toFixed(0)} y=${y.toFixed(0)} delta_x=${delta_x.toFixed(0)} delta_y=${delta_y.toFixed(0)} dist=${dist.toFixed(0)} velocity_x=${velocity_x.toFixed(0)} velocity_y=${velocity_y.toFixed(0)}`);
            }
            else {
                this.sprite.body.setVelocity(0, -idle_jump);            // jump up
                console.log(`Jump idle velocity_y=${(-idle_jump).toFixed(0)}`);
            }
        }
        else {
            if (isInRange && isAction) {
                // TODO: Implement Air control ?
            }
        }
    }
}
