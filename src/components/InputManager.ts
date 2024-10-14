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

    touchMove = { isDown: false, index: 0, initialX: 0, initialY: 0, pointerX: 0, pointerY: 0 };
    touchAction = { isDown: false, index: 0 };

    pointer1IsDown = false;
    pointer2IsDown = false;
    touchMoveUI: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.cursors = scene.input.keyboard?.createCursorKeys();

        scene.input.addPointer(2);

        // Escape button or escape key to go back to main menu
        const x = Global.screenToCameraX(Global.SCREEN_WIDTH - (10 + 30));
        const y = Global.screenToCameraY(10 + 30);
        const button = scene.add.nineslice(x, y, 'button', 0, 60, 60, 16, 16, 16, 16);
        button.setScrollFactor(0);
        button.setInteractive().on('pointerup', () => { scene.scene.start('MainMenu'); });
        const text = scene.add.text(x, y, "␛", Global.SCORE_STYLE).setOrigin(0.5);
        text.setScrollFactor(0);
        scene.input.keyboard?.addKey('ESC').on('down', () => { scene.scene.start('MainMenu'); });

        this.touchMoveUI = scene.add.image(256, Global.SCREEN_HEIGHT - 10, 'touch-move-ui').setOrigin(0.5, (256 - 32)/256);
        this.touchMoveUI.setScrollFactor(0);
        this.touchMoveUI.setVisible(false);
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

        // Touch input
        this.pointer1IsDown = this.checkTouchPointer(this.scene.input.pointer1, this.pointer1IsDown, 1);
        this.pointer2IsDown = this.checkTouchPointer(this.scene.input.pointer2, this.pointer2IsDown, 2);

        inputGame = this.virtualInput(this.touchMove.initialX, this.touchMove.initialY, this.touchMove.pointerX, this.touchMove.pointerY, this.touchMove.isDown, 32, inputGame);

        if (this.touchAction.isDown) {
            inputGame.isAction = true;
        }

        return inputGame;
    }

    checkTouchPointer(pointer: Phaser.Input.Pointer, memoIsDown: boolean, index: number): boolean {
        if (pointer.isDown && !memoIsDown) {
            memoIsDown = true;
            if (pointer.x < Global.SCREEN_CENTER_X) {
                if (!this.touchMove.isDown) {
                    this.touchMove.isDown = true;
                    this.touchMove.index = index;
                    this.touchMove.initialX = pointer.x;
                    this.touchMove.initialY = pointer.y;
                    // Update touchMoveUI position
                    this.touchMoveUI.x = Global.screenToCameraX(pointer.x);
                    this.touchMoveUI.y = Global.screenToCameraY(pointer.y);
                }
            }
            else {
                if (!this.touchAction.isDown) {
                    this.touchAction.isDown = true;
                    this.touchAction.index = index;
                }
            }
        }
        else if (!pointer.isDown && memoIsDown) {
            memoIsDown = false;
            if (this.touchMove.index == index) {
                this.touchMove.isDown = false;
            }
            if (this.touchAction.index == index) {
                this.touchAction.isDown = false;
            }
        }

        // Update touchMove position
        if (this.touchMove.isDown && this.touchMove.index == index) {
            this.touchMove.pointerX = pointer.x;
            this.touchMove.pointerY = pointer.y;
        }

        return memoIsDown;
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