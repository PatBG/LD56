import { Scene } from 'phaser';
import { Creature, CreatureState } from '../components/Creature';
import { Player } from '../components/Player';

export class Game extends Scene {
    player: Player;
    coinLayer: Phaser.Tilemaps.TilemapLayer | null;
    text: Phaser.GameObjects.Text;
    creatures: Creature[];

    // Scrores numbers
    nbSatiated: number;
    nbSleepy: number;
    nbCreatures: number;

    constructor() {
        super('Game');
    }

    create() {
        this.input.keyboard?.addKey('ESC').on('down', () => {
            this.scene.start('GameOver');
        }, this);

        // load the map 
        const map = this.make.tilemap({ key: 'map' });

        // tiles for the ground layer
        const groundTiles = map.addTilesetImage('tiles');
        if (!groundTiles) { console.error('groundTiles is not set'); return; }

        // create the ground layer
        const groundLayer = map.createLayer('World', groundTiles, 0, 0);
        if (!groundLayer) { console.error('groundLayer is not set'); return; }

        // Create eye candy layers
        map.createLayer('Background', groundTiles, 0, 0);
        const foregroundLayer = map.createLayer('Foreground', groundTiles, 0, 0);
        if (!foregroundLayer) { console.error('foregroundLayer is not set'); return; }
        foregroundLayer.depth = 1;

        // the player will collide with this layer
        groundLayer.setCollisionByExclusion([-1]);
        // set the boundaries of our game world
        this.physics.world.bounds.width = groundLayer.width;
        this.physics.world.bounds.height = groundLayer.height;

        this.player = new Player(this, groundLayer, 200, 200);

        // coin image used as tileset
        const coinTiles = map.addTilesetImage('coin');
        if (!coinTiles) { console.error('coinTiles is not set'); return; }
        // add coins as tiles
        this.coinLayer = map.createLayer('Coins', coinTiles, 0, 0);
        if (!this.coinLayer) { console.error('coinLayer is not set'); return; }
        this.coinLayer.setTileIndexCallback([17, 19], this.collectCoin, this);

        this.creatures = [];
        this.coinLayer.forEachTile(tile => {
            if (tile.index === 18) {
                const creature = new Creature(this, groundLayer, tile.x * 48 + 24, tile.y * 48 + 24);
                if (this.coinLayer != null) {
                    creature.coinCollider = this.physics.add.overlap(creature.sprite, this.coinLayer);
                }
                this.creatures.push(creature);
                this.coinLayer?.removeTileAt(tile.x, tile.y);
            }
            else if (tile.index === 19) {
                tile.setVisible(false);
            }
            else if (tile.index === 20) {
                this.player.sprite.setPosition(tile.x * 48 + 24, tile.y * 48 + 24);
                this.coinLayer?.removeTileAt(tile.x, tile.y);
            }
        });
        this.nbCreatures = this.creatures.length;

        this.text = this.add.text(-144, -72, '', {
            fontSize: '20px',
            backgroundColor: '#ffffff',
            padding: {
                left: 10,
                right: 10,
                top: 5,
                bottom: 5
            },
            color: '#000000'
        });
        this.text.setScrollFactor(0);
        this.nbSatiated = 0;
        this.nbSleepy = 0;
        this.displayScore();

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player.sprite);//, false, 1, 1, 500, 500);
        this.cameras.main.setDeadzone(400, 200);
        // set background color, so the sky is not black    
        this.cameras.main.setBackgroundColor('#CCCCFF');
        this.cameras.main.setZoom(0.75);
    }

    update(_time: number, _delta: number): void {
        this.player.update(_time, _delta);
        this.creatures.forEach(creature => creature.update(this.player.isAction, this.player.IsInRangeForAction.bind(this.player),
            this.player.sprite.x, this.player.sprite.y));
    }

    collectCoin(sprite: Phaser.GameObjects.Sprite, tile: Phaser.Tilemaps.Tile) {
        this.creatures.forEach(creature => {
            if (creature.sprite === sprite) {
                if (creature.creatureState === CreatureState.Hungry && tile.index === 17) {
                    creature.creatureState = CreatureState.Satiated;
                    creature.sprite.setFrame(creature.sprite.frame.name + 2);
                    this.coinLayer?.removeTileAt(tile.x, tile.y);       // remove the tile
                    this.nbSatiated++;
                    this.displayScore();
                }
                else if (creature.creatureState === CreatureState.Satiated && tile.index === 19) {
                    creature.creatureState = CreatureState.Sleepy;
                    creature.sprite.setFrame(4);

                    // console.log("CreatureState.Sleepy", creature.sprite.body.friction, creature.sprite.body.mass);
                    // creature.sprite.body.friction = new Phaser.Math.Vector2(1, 10);
                    // creature.sprite.body.mass = 0.1;
                    // console.log(creature.sprite.body.friction, creature.sprite.body.mass);

                    creature.coinCollider.destroy(); // remove the collider
                    this.nbSleepy++;
                    this.displayScore();
                }
            }
        });
        return false;
    }

    displayScore() {
        this.text.setText(`${this.nbSatiated}/${this.nbCreatures} Satiated   ${this.nbSleepy}/${this.nbCreatures} Sleepy`);
    }
}
