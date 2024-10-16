import { Scene, GameObjects } from 'phaser';
import { Global } from '../components/Global';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'background');

        this.add.text(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y - 220,
            'Game Jam: Ludum Dare 56       Theme: Tiny creatures         October 2024',
            Global.SCORE_STYLE).setOrigin(0.5);

        this.add.text(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y - 170,
            'Tiny followers by PatBG',
            Global.MENU_STYLE).setOrigin(0.5);

        this.add.text(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y - 100,
            '(Post-jam version)\r\n' +
            'using Phaser 3, TypeScript, Tiled, Krita and VS Code',
            Global.SCORE_STYLE).setOrigin(0.5);

        const buttonX = Global.SCREEN_CENTER_X;
        const buttonY = Global.SCREEN_CENTER_Y;
        for (let i = 1; i <= Global.totalLevels; i++) {
            this.displayButton(
                buttonX + ((i % 2 ? -200 : 200)),
                buttonY + (Math.floor((i - 1) / 2)) * 80,
                `Level ${i}`,
                i <= Global.maxLevel,
                () => {
                    if (!this.sys.game.device.os.desktop && !this.scale.isFullscreen) {
                        this.scale.startFullscreen();
                    }
                    Global.level = i;
                    this.scene.start('Game');
                }
            );
        }
        this.scale.stopFullscreen();

        if (Global.debug) {
            this.displayButton(
                buttonX,
                buttonY,
                `Reset progress`,
                Global.maxLevel > 1,
                () => {
                    Global.resetLevel();
                    console.log(`Reset progress`);
                    this.scene.start('MainMenu');
                }
            );
        }
    }

    displayButton(x: number, y: number, text: string, enabled: boolean, callback: () => void) {
        const button = this.add.nineslice(x, y, 'button', 0, 200, 60, 16, 16, 16, 16);
        if (enabled) {
            button.setInteractive().on('pointerup', callback);
        }
        else {
            button.setTint(0x999999);
        }
        this.add.text(x, y, text, Global.SCORE_STYLE).setOrigin(0.5);
    }
}
