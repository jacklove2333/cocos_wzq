import { _decorator, Component, Sprite, math, UIOpacity, SpriteFrame } from 'cc';
import { GameState } from './Game';
const { ccclass, property } = _decorator;

@ccclass('ChessItem')
export class ChessItem extends Component {

    /**棋子上颜色 */
    public setSprite(SpriteFrame: SpriteFrame, gameState: GameState) {
        this.setOpacity(255);
        let icon = this.node.getComponent(Sprite);
        if (!icon) {
            return;
        }
        icon.spriteFrame = SpriteFrame;
        icon.color = math.color(gameState);
    }

    /**棋子显隐 */
    public setOpacity(opacity: number = 0) {
        this.node.getComponent(UIOpacity).opacity = opacity;
    }

    /**获取棋子是否显示 */
    public getOpacity() {
        let opacity = this.node.getComponent(UIOpacity).opacity;
        return opacity === 255;
    }
}


