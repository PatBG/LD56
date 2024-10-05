import { Scene } from 'phaser';
import { Creature } from '../components/creature';
import { Player } from '../components/Player';

export class Game extends Scene {
    player: Player;
    coinLayer: Phaser.Tilemaps.TilemapLayer | null;
    text: Phaser.GameObjects.Text;
    score: number;
    creatures: Creature[];

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

        // the player will collide with this layer
        groundLayer.setCollisionByExclusion([-1]);
        // set the boundaries of our game world
        this.physics.world.bounds.width = groundLayer.width;
        this.physics.world.bounds.height = groundLayer.height;

        this.player = new Player(this, groundLayer, 200, 200);

        this.creatures = [];
        this.creatures.push(new Creature(this, groundLayer, 300, 200));
        this.creatures.push(new Creature(this, groundLayer, 350, 200));
        this.creatures.push(new Creature(this, groundLayer, 400, 200));

        // coin image used as tileset
        const coinTiles = map.addTilesetImage('coin');
        if (!coinTiles) { console.error('coinTiles is not set'); return; }
        // add coins as tiles
        this.coinLayer = map.createLayer('Coins', coinTiles, 0, 0);
        if (!this.coinLayer) { console.error('coinLayer is not set'); return; }
        this.coinLayer.setTileIndexCallback(17, this.collectCoin, this); // the coin id is 17
        // when the player overlaps with a tile with index 17, collectCoin will be called    
        this.physics.add.overlap(this.player.sprite, this.coinLayer);

        this.text = this.add.text(20, 570, '0', {
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
        this.score = 0;

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player.sprite);
        // set background color, so the sky is not black    
        this.cameras.main.setBackgroundColor('#ccccff');
    }

    update(_time: number, _delta: number): void {
        this.player.update(_time, _delta);
        this.creatures.forEach(creature => creature.update(this.player.isAction, this.player.IsInRangeForAction.bind(this.player),
            this.player.sprite.x, this.player.sprite.y));
    }

    collectCoin(_sprite: Phaser.GameObjects.Sprite, tile: Phaser.Tilemaps.Tile) {
        this.coinLayer?.removeTileAt(tile.x, tile.y);       // remove the tile/coin
        this.score++;                                      // increment the score
        this.text.setText(`${this.score}`);                 // set the text to show the current score
        return false;
    }
}
