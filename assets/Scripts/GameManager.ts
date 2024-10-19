import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager = null;
    static getInstance() {
        if (this._instance == null) {
          this._instance = new GameManager();
        }
        return this._instance;
      }

    start() {
        GameManager._instance = this;
    }

    update(deltaTime: number) {
        
    }

    onClickStart() {
        console.log("Start Game");
        director.loadScene("Game");
    }
}


