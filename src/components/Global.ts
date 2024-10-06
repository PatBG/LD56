
export abstract class Global {

    public static readonly debug = false;

    public static readonly SCREEN_WIDTH: number = 922;
    public static readonly SCREEN_HEIGHT: number = 487;
    public static readonly SCREEN_CENTER_X: number = Global.SCREEN_WIDTH / 2;
    public static readonly SCREEN_CENTER_Y: number = Global.SCREEN_HEIGHT / 2;

    public static readonly FONT_FAMILY = 'Comic Sans MS'; // 'Arial Black'

    public static readonly MENU_STYLE = {
        fontFamily: Global.FONT_FAMILY,
        fontSize: 38,
        color: '#ede0c5',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
    }

    public static readonly SCORE_STYLE = {
        fontFamily: Global.FONT_FAMILY,
        fontSize: 24,
        color: '#ede0c5',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
    }

    private static _level: number = NaN;
    private static _maxLevel: number = NaN;
    public static totalLevels = NaN;

    public static set level(value: number) {
        if (value <= Global.totalLevels) {
            if (value > Global._maxLevel) {
                Global._maxLevel = value;
                localStorage.setItem('maxLevel', Global._maxLevel.toString());
            }
            Global._level = value;
            localStorage.setItem('level', Global._level.toString());
        }
        else {
            console.error(`Invalid level ${value} (max: ${Global.totalLevels})`);
        }
    }

    public static get level(): number {
        if (isNaN(Global._level)) {
            Global._level = parseInt(localStorage.getItem('level') || '1');
        }
        return Global._level;
    }

    public static get maxLevel(): number {
        if (isNaN(Global._maxLevel)) {
            Global._maxLevel = parseInt(localStorage.getItem('maxLevel') || '1');
        }
        return Global._maxLevel;
    }

    public static resetLevel() {
        Global._maxLevel = 0;           // Force update of maxLevel
        Global.level = 1;
    }
}
