import { Scene } from 'phaser';
import { Creature, CreatureState } from '../components/Creature';
import { Player } from '../components/Player';
import { Global } from '../components/Global';

export enum TilesetCoin {
    Feed = 33,
    SpawnCreature,
    Nest,
    SpawnPlayer
}

export class Game extends Scene {
    player: Player;
    coinLayer: Phaser.Tilemaps.TilemapLayer | null;
    textScore: Phaser.GameObjects.Text;
    creatures: Creature[];

    // Scrores numbers
    nbFeeded: number;
    nbSleepy: number;
    nbCreatures: number;
    layerUI: Phaser.GameObjects.Layer;

    constructor() {
        super('Game');
    }

    create() {
        this.layerUI = this.add.layer();
        this.layerUI.setDepth(2);

        // load the map 
        const map = this.make.tilemap({ key: `map${Global.level}` });

        // tiles for the ground layer
        const groundTiles = map.addTilesetImage('tiles');
        if (!groundTiles) { console.error('groundTiles is not set'); return; }

        // create the ground layer
        const groundLayer = map.createLayer('World', groundTiles, 0, 0);
        if (!groundLayer) { console.error('groundLayer is not set'); return; }
        groundLayer.depth = 0.1;

        // Create eye candy layers
        const backgroundLayer = map.createLayer('Background', groundTiles, 0, 0);
        if (!backgroundLayer) { console.error('backgroundLayer is not set'); return; }
        backgroundLayer.depth = -1;
        const foregroundLayer = map.createLayer('Foreground', groundTiles, 0, 0);
        if (!foregroundLayer) { console.error('foregroundLayer is not set'); return; }
        foregroundLayer.depth = 1;

        if (Global.level === 1) {
            const helpSignLayer = map.createFromObjects('Help sign', { gid: 45, key: 'sign' });
            if (!helpSignLayer) { console.error('helpSignLayer is not set'); return; }
            // helpSignLayer.depth = -0.5;
            if (this.sys.game.device.os.desktop) {
                const helpDesktopLayer = map.createFromObjects('Help desktop', { gid: 43, key: 'help-desktop' });
                if (!helpDesktopLayer) { console.error('helpDesktopLayer is not set'); return; }
                // helpDesktopLayer.depth = 0.5;
            }
            else {
                const helpMobileLayer = map.createFromObjects('Help mobile', { gid: 44, key: 'help-mobile' });
                if (!helpMobileLayer) { console.error('helpMobileLayer is not set'); return; }
                // helpMobileLayer.depth = 0.5;
            }
        }

        // the player will collide with this layer
        groundLayer.setCollisionByExclusion([-1]);
        // set the boundaries of our game world
        this.physics.world.bounds.width = groundLayer.width;
        this.physics.world.bounds.height = groundLayer.height;

        this.player = new Player(this, groundLayer, this.layerUI, 200, 200);

        // coin image used as tileset
        const coinTiles = map.addTilesetImage('coin');
        if (!coinTiles) { console.error('coinTiles is not set'); return; }
        // add coins as tiles
        this.coinLayer = map.createLayer('Coins', coinTiles, 0, 0);
        if (!this.coinLayer) { console.error('coinLayer is not set'); return; }
        this.coinLayer.setTileIndexCallback([TilesetCoin.Feed, TilesetCoin.Nest], this.collectCoin, this);

        this.creatures = [];
        this.coinLayer.forEachTile(tile => {
            if (tile.index === TilesetCoin.SpawnCreature) {
                const creature = new Creature(this, groundLayer, tile.x * 48 + 24, tile.y * 48 + 24);
                if (this.coinLayer != null) {
                    creature.coinCollider = this.physics.add.overlap(creature.sprite, this.coinLayer);
                }
                this.creatures.push(creature);
                this.coinLayer?.removeTileAt(tile.x, tile.y);
            }
            else if (tile.index === TilesetCoin.Nest) {
                tile.setVisible(false);
            }
            else if (tile.index === TilesetCoin.SpawnPlayer) {
                this.player.sprite.setPosition(tile.x * 48 + 24, tile.y * 48 + 24);
                this.coinLayer?.removeTileAt(tile.x, tile.y);
            }
        });
        this.nbCreatures = this.creatures.length;

        this.textScore = this.add.text(Global.screenToCameraX(10), Global.screenToCameraY(10), '', Global.SCORE_STYLE);
        this.textScore.setScrollFactor(0);
        this.layerUI.add(this.textScore);

        this.nbFeeded = 0;
        this.nbSleepy = 0;
        this.displayScore();

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player.sprite);//, false, 1, 1, 500, 500);
        this.cameras.main.setDeadzone(400, 200);
        // set background color, so the sky is not black    
        this.cameras.main.setBackgroundColor('#CCCCFF');
        this.cameras.main.setZoom(Global.ZOOM_FACTOR);
    }

    update(_time: number, _delta: number): void {
        this.displayScore(); // DEBUG
        this.player.update(_time, _delta);
        this.creatures.forEach(creature => creature.update(this.player.isAction, this.player.IsInRangeForAction.bind(this.player),
            this.player.sprite.x, this.player.sprite.y));
    }

    collectCoin(sprite: Phaser.GameObjects.Sprite, tile: Phaser.Tilemaps.Tile) {
        this.creatures.forEach(creature => {
            if (creature.sprite === sprite) {
                if (creature.creatureState === CreatureState.Hungry && tile.index === TilesetCoin.Feed) {
                    creature.creatureState = CreatureState.Feeded;
                    creature.sprite.setFrame(creature.sprite.frame.name + 2);
                    this.coinLayer?.removeTileAt(tile.x, tile.y);       // remove the tile
                    this.nbFeeded++;
                    this.displayScore();
                    creature.gloupSound.play();
                }
                else if (creature.creatureState === CreatureState.Feeded && tile.index === TilesetCoin.Nest) {
                    creature.creatureState = CreatureState.Sleepy;
                    creature.sprite.setFrame(4);
                    creature.coinCollider.destroy(); // remove the collider
                    this.nbSleepy++;
                    this.displayScore();
                    if (this.nbSleepy === this.nbCreatures) {
                        this.endLevel();
                    }
                }
            }
        });
        return false;
    }

    displayScore() {
        const txt = `${this.nbFeeded}/${this.nbCreatures} Feeded     ${this.nbSleepy}/${this.nbCreatures} Sleepy`;
        //  + ` x=${this.input.pointer1.x.toFixed()} y=${this.input.pointer1.y.toFixed()}`;    // DEBUG
        this.textScore.setText(txt);
    }

    endLevel() {
        if (Global.level < Global.totalLevels) {
            this.displayBigButton(`Level ${Global.level} completed`, () => {
                Global.level++;
                this.scene.start('Game');
            });
        }
        else {
            this.endGame();
        }
    }

    endGame() {
        this.displayBigButton(
            "THE END\r\n" +
            "\r\n" +
            "Thank you for playing\r\n" +
            "                                                      PatBG",
            () => {
                this.scene.start('MainMenu');
            });
    }

    displayBigButton(text: string, callback: () => void) {
        const x = Global.SCREEN_CENTER_X;
        const y = Global.SCREEN_CENTER_Y;
        const button = this.add.nineslice(x, y, 'button', 0, 600, 200, 16, 16, 16, 16)
            .setScrollFactor(0)
            .setDepth(2)
            .setInteractive()
            .on('pointerup', callback);
        this.layerUI.add(button);
        const buttonText = this.add.text(x, y, text, Global.SCORE_STYLE)
            .setScrollFactor(0)
            .setDepth(2)
            .setOrigin(0.5);
        this.layerUI.add(buttonText);
    }
}
