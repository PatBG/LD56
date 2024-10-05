import { Scene } from 'phaser';

export class Game extends Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    coinLayer: Phaser.Tilemaps.TilemapLayer | null;
    text: Phaser.GameObjects.Text;
    score: number;

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

        // create the player sprite    
        this.player = this.physics.add.sprite(200, 200, 'player');
        this.player.setBounce(0.2); // our player will bounce from items
        this.player.setCollideWorldBounds(true); // don't go out of the map
        this.physics.add.collider(groundLayer, this.player);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('player', { prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // coin image used as tileset
        const coinTiles = map.addTilesetImage('coin');
        if (!coinTiles) { console.error('coinTiles is not set'); return; }
        // add coins as tiles
        this.coinLayer = map.createLayer('Coins', coinTiles, 0, 0);
        if (!this.coinLayer) { console.error('coinLayer is not set'); return; }
        this.coinLayer.setTileIndexCallback(17, this.collectCoin, this); // the coin id is 17
        // when the player overlaps with a tile with index 17, collectCoin will be called    
        this.physics.add.overlap(this.player, this.coinLayer);

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
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.score = 0;

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player);
        // set background color, so the sky is not black    
        this.cameras.main.setBackgroundColor('#ccccff');
    }

    update(_time: number, _delta: number): void {
        if (!this.cursors) return;

        if (this.cursors.left.isDown) {                     // if the left arrow key is down
            this.player.body.setVelocityX(-200);            // move left
            this.player.anims.play('walk', true);           // play walk animation
            this.player.flipX = true;                        // flip the sprite to the left
        }
        else if (this.cursors?.right.isDown) {              // if the right arrow key is down
            this.player.body.setVelocityX(200);             // move right
            this.player.anims.play('walk', true);           // play walk animatio
            this.player.flipX = false;                      // use the original sprite looking to the right
        } else {
            this.player.body.setVelocityX(0);
            this.player.anims.play('idle', true);
        }

        if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
            this.player.body.setVelocityY(-500);            // jump up
        }
    }

    collectCoin(_sprite: Phaser.GameObjects.Sprite, tile: Phaser.Tilemaps.Tile) {
        this.coinLayer?.removeTileAt(tile.x, tile.y);       // remove the tile/coin
        this.score ++;                                      // increment the score
        this.text.setText(`${this.score}`);                 // set the text to show the current score
        return false;
    }
}
