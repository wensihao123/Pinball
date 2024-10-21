import { _decorator, Component, director, Node } from "cc";
import { MAX_LEVLES } from "./Common/constants";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  private static _instance: GameManager = null;
  static getInstance() {
    if (this._instance == null) {
      this._instance = new GameManager();
    }
    return this._instance;
  }

  private _totalLevels = MAX_LEVLES;
  private _currentLevel = 1;

  public get currentLevel() {
    return this._currentLevel;
  }

  start() {
    GameManager._instance = this;
  }

  update(deltaTime: number) {}

  onClickStart() {
    console.log("Start Game");
    director.loadScene("Game");
  }

  setCurrentLevel(value) {
    this._currentLevel = value;
  }

  nextLevel() {
    if (this._currentLevel === this._totalLevels) {
      this._currentLevel = 1;
    } else {
      this._currentLevel++;
    }
  }
}
