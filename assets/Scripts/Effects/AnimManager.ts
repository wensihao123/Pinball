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
  Animation,
} from "cc";
import {
  RECT_UNIT_SIZE,
  STRING_FADE_ANIMATION,
  STRING_X_SIZE,
  STRING_Y_SIZE,
} from "../Common/constants";
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
  @property(Prefab)
  CircleFramePrefab: Prefab = null;
  @property(Prefab)
  StringFramePrefab: Prefab = null;
  @property(Prefab)
  TriangleFramePrefab: Prefab = null;
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

  onPlayCircleFrameAnim(pos: Vec3, scale: Vec3) {
    const circleFrame = instantiate(this.CircleFramePrefab);
    circleFrame.setPosition(pos);
    const frameUI = circleFrame.getComponent(UITransform);
    frameUI.width = scale.x * RECT_UNIT_SIZE;
    frameUI.height = scale.y * RECT_UNIT_SIZE;
    const frameOpacity = circleFrame.getComponent(UIOpacity);
    this.AnimBlocks.addChild(circleFrame);
    tween(frameOpacity).to(0.3, { opacity: 0 }).start();
    tween(circleFrame)
      .to(0.3, { scale: new Vec3(1.3, 1.3, 0) })
      .call(() => {
        circleFrame.destroy();
      })
      .start();
  }

  onPlayStringAnim(pos: Vec3, scale: Vec3, euler: Vec3) {
    const stringFrame = instantiate(this.StringFramePrefab);
    stringFrame.setPosition(pos);
    const frameUI = stringFrame.getComponent(UITransform);
    frameUI.width = scale.x * STRING_X_SIZE;
    frameUI.height = scale.y * STRING_Y_SIZE;
    const frameOpacity = stringFrame.getComponent(UIOpacity);
    stringFrame.eulerAngles = euler;
    this.AnimBlocks.addChild(stringFrame);
    this.scheduleOnce(() => {
      tween(frameOpacity)
        .to(0.6, { opacity: 0 })
        .call(() => {
          stringFrame.destroy();
        })
        .start();
    }, 0.2);
    stringFrame.getComponent(Animation).play(STRING_FADE_ANIMATION);
  }

  onPlayTriangleAnim(pos: Vec3, scale: Vec3, euler: Vec3) {
    const triangleFrame = instantiate(this.RectFramePrefab);
    triangleFrame.setPosition(pos);
    const frameUI = triangleFrame.getComponent(UITransform);
    frameUI.width = scale.x * RECT_UNIT_SIZE;
    frameUI.height = scale.y * RECT_UNIT_SIZE;
    const frameOpacity = triangleFrame.getComponent(UIOpacity);
    triangleFrame.eulerAngles = euler;
    this.AnimBlocks.addChild(triangleFrame);
    tween(frameOpacity).to(0.3, { opacity: 0 }).start();
    tween(triangleFrame)
      .to(0.3, { scale: new Vec3(1.3, 1.3, 0) })
      .call(() => {
        triangleFrame.destroy();
      })
      .start();
  }
}
