import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  tween,
  UIOpacity,
  UITransform,
  Vec3,
} from "cc";
import { RECT_UNIT_SIZE } from "../Common/constants";
const { ccclass, property } = _decorator;

@ccclass("AnimManager")
export class AnimManager extends Component {
  private static _instance: AnimManager = null;
  public static getInstance() {
    if (this._instance == null) {
      this._instance = new AnimManager();
    }
    return this._instance;
  }

  @property(Prefab)
  RectFramePrefab: Prefab = null;
  @property(Node)
  AnimBlocks: Node = null;

  start() {
    AnimManager._instance = this;
  }

  onPlayRectFrameAnim(pos: Vec3, scale: Vec3, euler: Vec3) {
    const rectFrame = instantiate(this.RectFramePrefab);
    rectFrame.setPosition(pos);
    const frameUI = rectFrame.getComponent(UITransform);
    frameUI.width = scale.x * RECT_UNIT_SIZE;
    frameUI.height = scale.y * RECT_UNIT_SIZE;
    const frameOpacity = rectFrame.getComponent(UIOpacity);
    rectFrame.eulerAngles = euler;
    this.AnimBlocks.addChild(rectFrame);
    tween(frameOpacity).to(0.3, { opacity: 0 }).start();
    tween(rectFrame)
      .to(0.3, { scale: new Vec3(1.3, 1.3, 0) })
      .call(() => {
        rectFrame.destroy();
      })
      .start();
  }
}
