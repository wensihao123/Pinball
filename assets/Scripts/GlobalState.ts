import { _decorator, Component, Node, EventTarget } from "cc";
import {
  CLEAR_TIMER,
  CURRENT_TRIAL_TIME,
  DISABLE_BALL_CONTROLL,
  LOAD_LEVEL,
  LOADED_BLACK_BLOCKS,
  LOADED_WHITE_BLOCKS,
  MAX_TRIAL_TIME,
  OUT_OF_BOUNDS,
  REMAINING_WHITE_BLOCKS,
  RESET_LEVEL,
} from "./Common/constants";
import { GameManager } from "./GameManager";
import { AudioManager } from "./Effects/AudioManager";
const { ccclass, property } = _decorator;

const InitState = {
  disableBallControll: false,
  currentTrialTime: 0,
  outOfBounds: false,
  loadedWhiteBlocks: [],
  loadedBlackBlocks: [],
  remainingWhiteBlocks: 0,
};

@ccclass("GlobalState")
export class GlobalState extends Component {
  private static _instance: GlobalState = null;
  public static getInstance() {
    if (this._instance == null) {
      this._instance = new GlobalState();
    }
    return this._instance;
  }

  private timerInterval = null;

  private gameState: { [key: string]: any } = {
    disableBallControll: false,
    currentTrialTime: 0,
    outOfBounds: false,
    loadedWhiteBlocks: [],
    loadedBlackBlocks: [],
    remainingWhiteBlocks: 0,
  };
  private eventTarget: EventTarget = new EventTarget();

  start() {
    GlobalState._instance = this;
  }

  setState(key, value) {
    const oldValue = this.gameState[key];
    if (oldValue === value) return;
    console.log(`GlobalState: ${key} set from ${oldValue} to ${value}`);
    this.gameState[key] = value;
    this.eventTarget.emit(key, value, oldValue);
  }

  getState(key) {
    return this.gameState[key];
  }

  deleteState(key, initValue = undefined) {
    this.setState(key, initValue);
  }

  clearAllState() {
    this.gameState = { ...InitState };
  }

  addListener(key: string, callback: (newVal?, oldVal?) => void) {
    this.eventTarget.on(key, callback);
  }

  removeListener(key: string, callback: (newVal?, oldVal?) => void) {
    this.eventTarget.off(key, callback);
  }

  //LevelManager
  addWhiteBlock(node: Node) {
    const whiteBlocks = this.gameState.loadedWhiteBlocks;
    this.setState(LOADED_WHITE_BLOCKS, [...whiteBlocks, node]);
    this.setState(REMAINING_WHITE_BLOCKS, whiteBlocks.length + 1);
  }
  removeWhiteBlock(node: Node) {
    const whiteBlocks = this.gameState.loadedWhiteBlocks;
    const index = whiteBlocks.indexOf(node);
    whiteBlocks.splice(index, 1);
    this.setState(LOADED_WHITE_BLOCKS, whiteBlocks);
  }
  addBlackBlock(node: Node) {
    const blackBlocks = this.gameState.loadedBlackBlocks;
    this.setState(LOADED_BLACK_BLOCKS, [...blackBlocks, node]);
  }
  removeBlackBlock(node: Node) {
    const blackBlocks = this.gameState.loadedBlackBlocks;
    const index = blackBlocks.indexOf(node);
    blackBlocks.splice(index, 1);
    this.setState(LOADED_BLACK_BLOCKS, blackBlocks);
  }
  onWhiteBlockHit() {
    const remainingWhiteBlocks = this.gameState.remainingWhiteBlocks - 1;
    this.setState(REMAINING_WHITE_BLOCKS, remainingWhiteBlocks);
  }
  checkCompleteLevel() {
    if (
      this.gameState.loadedWhiteBlocks !== 0 &&
      this.gameState.remainingWhiteBlocks === 0
    ) {
      this.clearAllState();
      GameManager.getInstance().nextLevel();
      this.eventTarget.emit(LOAD_LEVEL);
    } else {
      this.deleteState(LOADED_WHITE_BLOCKS, []);
      this.deleteState(LOADED_BLACK_BLOCKS, []);
      this.eventTarget.emit(RESET_LEVEL);
    }
  }

  //BallController
  startTrial() {
    this.setState(DISABLE_BALL_CONTROLL, true);
    this.setState(CURRENT_TRIAL_TIME, 0);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      this.setState(CURRENT_TRIAL_TIME, this.gameState.currentTrialTime + 1);
      if (this.gameState.currentTrialTime >= MAX_TRIAL_TIME) {
        this.stopTimer();
      }
    }, 1000);
  }
  outOfBounds() {
    this.setState(OUT_OF_BOUNDS, true);
    this.stopTimer();
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.setState(CURRENT_TRIAL_TIME, 0);
      this.setState(DISABLE_BALL_CONTROLL, false);
      this.eventTarget.emit(CLEAR_TIMER);
      this.timerInterval = null;
    }
    AudioManager.getInstance().resetCounts();
    this.checkCompleteLevel();
  }
}
