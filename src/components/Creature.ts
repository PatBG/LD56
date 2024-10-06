
interface IsInRange {
    (x: number, y: number): boolean;
}

export enum CreatureState {
    Hungry = 0,
    Feeded = 2,
    Sleepy = 4,
}

export class Creature {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    creatureState: CreatureState;
    coinCollider: Phaser.Physics.Arcade.Collider;
    goToPlayer: boolean;        // When triggered, the creature will jump to player, even if he goes out of the range

    constructor(scene: Phaser.Scene, groundLayer: Phaser.Tilemaps.TilemapLayer, x: number, y: number) {
        this.creatureState = CreatureState.Hungry;
        this.goToPlayer = false;
        this.sprite = scene.physics.add.sprite(x, y, 'creature');
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);                    // don't go out of the map
        scene.physics.add.collider(groundLayer, this.sprite);       // ensure groundLayer is passed as an argument
    }

    update(isAction: boolean, isInRangeCallback: IsInRange, x: number, y: number) {
        if (this.creatureState === CreatureState.Sleepy) {
            // If creature is sleepy, it will move slowly
            if (this.sprite.body.onFloor()) {
                const idle_jump = 200 + Phaser.Math.Between(50, 0);
                this.sprite.body.setVelocity(0, -(idle_jump / 2));            // jump up half the distance
            }
        }
        else {
            const isInRange = isInRangeCallback(this.sprite.x, this.sprite.y);
            if (isInRange && isAction && this.goToPlayer === false) {
                this.goToPlayer = true;
            }
            this.sprite.setFrame(this.creatureState.valueOf() + (this.goToPlayer ? 1 : 0));
            if (this.sprite.body.onFloor()) {                           // if creature is on the ground: jump!
                const idle_jump = 200 + Phaser.Math.Between(50, 0);
                if (this.goToPlayer) {
                    this.goToPlayer = false;
                    const magic_number_y = 2;
                    const delta_top_of_target = -100;
                    const action_jump = 550 + Phaser.Math.Between(50, 0);
                    const delta_x = x - this.sprite.x;
                    const delta_y = (y + delta_top_of_target) - this.sprite.y;
                    const dist = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
                    const coef_x = Math.min(1, idle_jump / dist);
                    const coef_y = Math.min(1, action_jump / dist) * magic_number_y;
                    const velocity_x = delta_x * coef_x;
                    const velocity_y = Math.min(-idle_jump, delta_y * coef_y);
                    this.sprite.body.setVelocity(velocity_x, velocity_y);                   // jump to player
                }
                else {
                    this.sprite.body.setVelocity(Phaser.Math.Between(-4, 4), -idle_jump);   // jump idle
                }
            }
        }
    }
}
