import { Scene } from 'phaser';
import { Global } from '../components/Global';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game
        this.load.setPath('assets');

        // map made with Tiled in JSON format
        this.load.tilemapTiledJSON('map1', 'map1.json');
        this.load.tilemapTiledJSON('map2', 'map2.json');
        Global.totalLevels = 2;

        this.load.tilemapTiledJSON('mapTest', 'mapTest.json');

        // tiles in spritesheet 
        this.load.image('tiles', 'tiles-extruded.png');

        // tiles coin image
        this.load.spritesheet('coin', 'coinGold.png', { frameWidth: 48, frameHeight: 48 });
        // player animations
        this.load.spritesheet('player', 'player.png', { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('creature', 'creature.png', { frameWidth: 16, frameHeight: 16 });

        this.load.image('button', 'button.png');

        this.load.image('touch-move-ui', 'touch-move-ui.png');

        this.load.image('sign', 'sign.png');
        this.load.image('help-mobile', 'help-mobile.png');
        this.load.image('help-desktop', 'help-desktop.png');

        this.load.audio('gloup', 'gloup.wav');

        this.load.audio('jump1', 'jump1.wav');
        this.load.audio('jump2', 'jump2.wav');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
