import { _decorator, Component, Node, Label, Prefab, Sprite, instantiate, SpriteFrame } from 'cc';
import { ChessItem } from './ChessItem';
const { ccclass, property } = _decorator;

export enum GameState {
    BLACK = "#000000",
    WHITE = "#FFFFFF"
}

@ccclass('Game')
export class Game extends Component {

    @property(Label)
    private label_tip!: Label;
    @property(Node)
    private node_content!: Node;
    @property(Node)
    private btn_user!: Node;
    @property(Node)
    private btn_ai!: Node;
    @property(Prefab)
    private prefab_chessItem!: Prefab;
    @property(Node)
    private node_touch!: Node;
    @property(SpriteFrame)
    private sprite_black!: SpriteFrame;
    @property(SpriteFrame)
    private sprite_white!: SpriteFrame;

    /**玩家执黑棋 */
    private gameState: GameState = GameState.BLACK;
    /**五元组 */
    private fiveGroup: number[][] = [];
    /**当前落子的位置 */
    private nPos: number = 0;

    /**初始化棋盘 */
    onLoad() {
        this.node_content.removeAllChildren();
        for (let i = 0; i < 15 * 15; i++) {
            let item = instantiate(this.prefab_chessItem);
            item.getComponent(ChessItem).setOpacity();
            this.node_content.addChild(item);
            item.on(Node.EventType.TOUCH_END, () => {
                if (item.getComponent(ChessItem).getOpacity()) {
                    return;
                }
                this.gameState = GameState.BLACK;
                this.downPiece(i);
            }, this)
        }

        this.fiveGroup = [];
        /**横向 */
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 11; x++) {
                this.fiveGroup.push([y * 15 + x, y * 15 + x + 1, y * 15 + x + 2, y * 15 + x + 3, y * 15 + x + 4]);
            }
        }
        /**竖向 */
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 11; y++) {
                this.fiveGroup.push([x + y * 15, x + (y + 1) * 15, x + (y + 2) * 15, x + (y + 3) * 15, x + (y + 4) * 15]);
            }
        }
        /**左上-右下 */
        for (let y = 0; y < 11; y++) {
            for (let x = 0; x < 11; x++) {
                this.fiveGroup.push([y * 15 + x, (y + 1) * 15 + x + 1, (y + 2) * 15 + x + 2, (y + 3) * 15 + x + 3, (y + 4) * 15 + x + 4]);
            }
        }
        /**左下-右上 */
        for (let y = 4; y < 15; y++) {
            for (let x = 0; x < 11; x++) {
                this.fiveGroup.push([y * 15 + x, (y - 1) * 15 + x + 1, (y - 2) * 15 + x + 2, (y - 3) * 15 + x + 3, (y - 4) * 15 + x + 4]);
            }
        }

        this.resetGame();
    }

    /**玩家/ai下棋后检测 */
    private downPiece(idx: number) {
        let item = this.node_content.children[idx];
        if (!item) {
            return;
        }
        let sprite = this.gameState === GameState.BLACK ? this.sprite_black : this.sprite_white;
        item.getComponent(ChessItem).setSprite(sprite, this.gameState);
        this.nPos = idx;
        this.checkOver();
    }

    /**ai下棋逻辑 */
    private aiDown() {
        /**五元组分数 */
        let fiveGroupScore: number[] = [];
        for (let i = 0; i < this.fiveGroup.length; i++) {
            let nBlack: number = 0;
            let nWhite: number = 0;
            for (let j = 0; j < this.fiveGroup[i].length; j++) {
                let index = this.fiveGroup[i][j];
                let item = this.node_content.children[index];
                if (item.getComponent(ChessItem).getOpacity()) {
                    if (item.getComponent(Sprite).spriteFrame === this.sprite_black) {
                        nBlack++;
                    } else {
                        nWhite++;
                    }
                }
            }
            if (nBlack === 0 && nWhite === 0) {
                fiveGroupScore[i] = 1;
            } else if (nBlack > 0 && nWhite > 0) {
                fiveGroupScore[i] = 0;
            } else if (nWhite === 4) {
                fiveGroupScore[i] = 10;
            } else if (nBlack === 4) {
                fiveGroupScore[i] = 9;
            } else if (nWhite === 3) {
                fiveGroupScore[i] = 8;
            } else if (nBlack === 3) {
                fiveGroupScore[i] = 7;
            } else if (nWhite === 2) {
                fiveGroupScore[i] = 6;
            } else if (nBlack === 2) {
                fiveGroupScore[i] = 5;
            } else if (nWhite === 1) {
                fiveGroupScore[i] = 4;
            } else if (nBlack === 1) {
                fiveGroupScore[i] = 3;
            }
        }
        /**找到最大分数的五元组 */
        let index1: number = 0;
        let maxScore: number = 0;
        for (let m = 0; m < fiveGroupScore.length; m++) {
            if (fiveGroupScore[m] === 10) {
                index1 = m;
                break;
            }
            if (fiveGroupScore[m] > maxScore) {
                maxScore = fiveGroupScore[m];
                index1 = m;
            }
        }
        /**找到该五元组中落子的位置，落子最好位置在有棋子的旁边 */
        let index2: number = 0;
        let bDown: boolean = false;
        for (let n = 0; n < this.fiveGroup[index1].length; n++) {
            let item = this.node_content.children[this.fiveGroup[index1][n]];
            if (!item) {
                return;
            }
            if (!bDown && !item.getComponent(ChessItem).getOpacity()) {
                index2 = n;
            }
            if (!bDown && item.getComponent(ChessItem).getOpacity()) {
                bDown = true;
            }
            if (bDown && !item.getComponent(ChessItem).getOpacity()) {
                index2 = n;
                break;
            }
        }


        let pos: number = this.fiveGroup[index1][index2];
        if (pos) {
            this.gameState = GameState.WHITE;
            this.downPiece(pos);
        }
    }

    /**检测游戏是否结束 */
    private checkOver() {
        let bOver: boolean = this.checkFivePiece();
        let bNowUser: boolean = this.gameState === GameState.BLACK;
        if (bOver) {
            let strTip: string = bNowUser ? "游戏结束：玩家胜" : "游戏结束：ai胜";
            this.resetGame(strTip);
        } else {
            this.gameState = bNowUser ? GameState.WHITE : GameState.BLACK;
            if (bNowUser) {
                this.node_touch.active = true;
                /**ai延时1s后下棋 */
                this.scheduleOnce(() => {
                    this.aiDown();
                }, 1)
            } else {
                this.node_touch.active = false;
            }
        }
    }

    /**判断是否是相同的棋子 */
    private checkPieceDown(nPos: number, sprite: SpriteFrame) {
        let item = this.node_content.children[nPos];
        if (item && item.getComponent(ChessItem).getOpacity() && item.getComponent(Sprite).spriteFrame === sprite) {
            return true;
        }
        return false;
    }

    /**判断是否五子连珠 */
    private checkFivePiece() {
        /**当前棋子列 */
        let row_x: number = this.nPos % 15;
        /**当前棋子行 */
        let row_y: number = Math.floor(this.nPos / 15);
        let sprite = this.gameState === GameState.BLACK ? this.sprite_black : this.sprite_white;

        /**横向 */
        let num: number = 1;
        for (let x = row_x - 1; x >= 0; x--) {
            if (this.checkPieceDown(row_y * 15 + x, sprite)) {
                num++;
            } else {
                break;
            }
        }
        if (num >= 5) {
            return true;
        }
        for (let x = row_x + 1; x < 15; x++) {
            if (this.checkPieceDown(row_y * 15 + x, sprite)) {
                num++;
            } else {
                break;
            }
        }
        if (num >= 5) {
            return true;
        }
        /**竖向 */
        num = 1;
        for (let y = row_y - 1; y >= 0; y--) {
            if (this.checkPieceDown(y * 15 + row_x, sprite)) {
                num++;
            } else {
                break;
            }
        }
        if (num >= 5) {
            return true;
        }
        for (let y = row_y + 1; y < 15; y++) {
            if (this.checkPieceDown(y * 15 + row_x, sprite)) {
                num++;
            } else {
                break;
            }
        }
        if (num >= 5) {
            return true;
        }
        /**左上-右下 */
        num = 1;
        for (let x = row_x - 1; x >= 0; x--) {
            let index = (row_y - (row_x - x)) * 15 + x;
            if (this.checkPieceDown(index, sprite)) {
                num++;
            } else {
                break;
            }
        }
        if (num >= 5) {
            return true;
        }
        for (let x = row_x + 1; x < 15; x++) {
            let index = (row_y + (x - row_x)) * 15 + x;
            if (this.checkPieceDown(index, sprite)) {
                num++;
            } else {
                break;
            }
        }
        if (num >= 5) {
            return true;
        }
        /**左下-右上 */
        num = 1;
        for (let x = row_x - 1; x >= 0; x--) {
            let index = (row_y + (row_x - x)) * 15 + x;
            if (this.checkPieceDown(index, sprite)) {
                num++;
            } else {
                break;
            }
        }
        if (num >= 5) {
            return true;
        }
        for (let x = row_x + 1; x < 15; x++) {
            let index = (row_y - (x - row_x)) * 15 + x;
            if (this.checkPieceDown(index, sprite)) {
                num++;
            } else {
                break;
            }
        }
        if (num >= 5) {
            return true;
        }
        return false;
    }

    /**重置游戏 */
    private resetGame(strTip?: string) {
        this.gameState = GameState.BLACK;
        if (strTip) {
            this.label_tip.string = strTip;
        } else {
            this.label_tip.string = "开始游戏，请先选择先后手";
        }
        this.node_touch.active = true;
        this.btn_user.active = true;
        this.btn_ai.active = true;
    }

    /**玩家先手 */
    private firstUser() {
        this.startGame();
    }

    /**ai先手 */
    private firstAi() {
        this.startGame();
        let centerPos: number = (15 * 15 - 1) / 2;
        let item = this.node_content.children[(centerPos)];
        item.getComponent(ChessItem).setSprite(this.sprite_white, GameState.WHITE);
    }

    /**开始游戏 */
    private startGame() {
        this.label_tip.string = '';
        for (let i = 0; i < this.node_content.children.length; i++) {
            let item = this.node_content.children[i];
            item.getComponent(ChessItem).setOpacity();
        }
        this.node_touch.active = false;
        this.btn_user.active = false;
        this.btn_ai.active = false;
    }

    /**ai下棋时禁止触摸 */
    private clickNotTouch() {
        if (this.btn_ai.active) {
            window.alert("请点击开始游戏");
        } else {
            window.alert("请等待ai下棋");
        }
    }
}


