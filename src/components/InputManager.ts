import { Global } from "./Global";

interface InputGame {
    moveLeft: boolean;
    moveRight: boolean;
    moveUp: boolean;
    isAction: boolean;
}

export class InputManager {
    scene: Phaser.Scene;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    touchMove = { x: 0, y: 0, isDown: false };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.cursors = scene.input.keyboard?.createCursorKeys();

        scene.input.addPointer(2);

        // Escape button or escape key to go back to main menu
        const x = Global.SCREEN_WIDTH + 110;
        const y = -40;
        const button = scene.add.nineslice(x, y, 'button', 0, 60, 60, 16, 16, 16, 16);
        button.setScrollFactor(0);
        button.setInteractive().on('pointerup', () => { scene.scene.start('MainMenu'); });
        const text = scene.add.text(x, y, "␛", Global.SCORE_STYLE).setOrigin(0.5);
        text.setScrollFactor(0);
        scene.input.keyboard?.addKey('ESC').on('down', () => { scene.scene.start('MainMenu'); });
    }

    getInput(x: number, y: number): InputGame {
        // Init with Keyboard input or false if none
        let inputGame: InputGame = {
            moveLeft: this.cursors ? this.cursors.left.isDown : false,
            moveRight: this.cursors ? this.cursors.right.isDown : false,
            moveUp: this.cursors ? this.cursors.up.isDown : false,
            isAction: this.cursors ? this.cursors.space.isDown : false
        };

        // Mouse input
        inputGame = this.virtualInput(x, y, this.scene.input.mousePointer.worldX, this.scene.input.mousePointer.worldY, this.scene.input.mousePointer.isDown, 32, inputGame);

        // Apply Touch input if touch is down
        if (this.scene.input.pointer1.isDown && !this.touchMove.isDown) {
            this.touchMove.x = this.scene.input.pointer1.worldX;
            this.touchMove.y = this.scene.input.pointer1.worldY;
            this.touchMove.isDown = true;
        }
        else if (!this.scene.input.pointer1.isDown && this.touchMove.isDown) {
            this.touchMove.isDown = false;
        }

        inputGame = this.virtualInput(this.touchMove.x, this.touchMove.y, this.scene.input.pointer1.worldX, this.scene.input.pointer1.worldY, this.touchMove.isDown, 32, inputGame);

        if (this.scene.input.pointer2.isDown) {
            inputGame.isAction = true;
        }

        return inputGame;
    }

    virtualInput(x: number, y: number, pointerX: number, pointerY: number, pointerIsDown: boolean, ignoreDist: number, inputGame: InputGame): InputGame {
        if (pointerIsDown) {
            if (pointerX < x - ignoreDist) {
                inputGame.moveLeft = true;
            }
            else if (pointerX > x + ignoreDist) {
                inputGame.moveRight = true;
            }
            if (pointerY < y - ignoreDist) {
                inputGame.moveUp = true;
            }
        }
        return inputGame;
    }
}