import {
  _decorator,
  Collider2D,
  Component,
  EventTouch,
  Game,
  input,
  Input,
  instantiate,
  Node,
  Prefab,
  RigidBody2D,
  tween,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
import {
  DISABLE_BALL_CONTROLL,
  MIN_SWIPE_DISTANCE,
  OUT_OF_BOUNDS,
} from "../Common/constants";
import { GlobalState } from "../GlobalState";
const { ccclass, property } = _decorator;

@ccclass("BallController")
export class BallController extends Component {
  private globalState: any = null;

  @property(Node)
  ballNode: Node = null;
  @property(Node)
  ballAimNode: Node = null;
  @property(Node)
  tailNode: Node = null;
  @property(Prefab)
  aimBallPrefab: Prefab = null;
  @property
  ballSpeed = 20;
  @property
  aimBallCount = 9;
  @property
  tailBallLifetime = 0.4;

  private touchStartPos: Vec2 = new Vec2();
  private touchEndPos: Vec2 = new Vec2();
  private aimBalls: Node[] = [];
  private recordTimeGap = 0.032;
  private recordTimer = 0;

  addEventListeners() {
    this.globalState.addListener(
      DISABLE_BALL_CONTROLL,
      this.onDisableBallControll.bind(this)
    );
  }

  protected onLoad(): void {
    this.globalState = GlobalState.getInstance();
    this.addEventListeners();
    this.ballNode.active = false;
    this.aimBalls = Array.from({ length: this.aimBallCount }, (_, i) => {
      const aimBall = instantiate(this.aimBallPrefab);
      aimBall.active = false;
      this.ballAimNode.addChild(aimBall);
      return aimBall;
    });
    this.enableTouch();
  }

  protected onDestroy(): void {
    this.disableTouch();
  }

  enableTouch() {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  disableTouch() {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  protected update(deltaTime: number) {
    const ballPosition = this.ballNode.getPosition();
    if (
      ballPosition.y < -670 ||
      ballPosition.y > 670 ||
      ballPosition.x < -390 ||
      ballPosition.x > 390
    ) {
      this.globalState.outOfBounds();
    }
    this.recordTimer += deltaTime;
    if (this.recordTimer > this.recordTimeGap && this.ballNode.active) {
      const tailBall = instantiate(this.aimBallPrefab);
      this.tailNode.addChild(tailBall);
      tailBall.setPosition(this.ballNode.getPosition());
      tween(tailBall)
        .to(this.tailBallLifetime, { scale: new Vec3(0, 0, 1) })
        .call(() => {
          tailBall.destroy();
        })
        .start();
    }
  }

  protected onTouchStart(event: EventTouch): void {
    this.ballNode.active = false;
    this.ballNode.getComponent(Collider2D).enabled = false;
    this.touchStartPos = event.getUILocation();
    const uiTransform = this.node.getComponent(UITransform);
    const localPos = uiTransform.convertToNodeSpaceAR(
      new Vec3(event.getUILocation().x, event.getUILocation().y, 0)
    );
    this.ballNode.setPosition(localPos);
    this.ballNode.active = true;
    this.ballNode.getComponent(RigidBody2D).linearVelocity = new Vec2(0, 0);
  }

  protected onTouchMove(event: EventTouch): void {
    const currentPos = event.getUILocation();
    const uiTransform = this.node.getComponent(UITransform);
    const localPos = uiTransform.convertToNodeSpaceAR(
      new Vec3(currentPos.x, currentPos.y, 0)
    );
    this.aimBalls.forEach((aimBall) => {
      aimBall.active = true;
    });
    this.setAimLine(localPos);
  }

  protected onTouchEnd(event: EventTouch): void {
    this.touchEndPos = event.getUILocation();
    const aimVector = event.getUILocation().subtract(this.touchStartPos);
    const ballFlyTime =
      aimVector.length() /
      aimVector.normalize().multiplyScalar(this.ballSpeed).length();
    const timeStep = ballFlyTime / 28 / this.aimBallCount;
    this.aimBalls.forEach((aimBall, i) => {
      this.scheduleOnce(() => {
        aimBall.active = false;
      }, timeStep * i);
    });
    this.setBallVelocity();
  }

  setBallVelocity(): void {
    const swipeVector = this.touchEndPos.subtract(this.touchStartPos);
    if (swipeVector.length() < MIN_SWIPE_DISTANCE) {
      this.ballNode.active = false;
      this.tailNode.removeAllChildren();
      return;
    }
    this.ballNode.getComponent(Collider2D).enabled = true;
    const velocity = swipeVector.normalize().multiplyScalar(this.ballSpeed);
    this.ballNode.getComponent(RigidBody2D).linearVelocity = new Vec2(
      velocity.x,
      velocity.y
    );
    this.globalState.startTrial();
  }

  setAimLine(position: Vec3): void {
    this.aimBalls.forEach((aimBall) => {
      aimBall.setPosition(this.ballNode.getPosition());
    });
    const aimVector = position.subtract(this.ballNode.getPosition());
    const stepX = aimVector.x / this.aimBallCount;
    const stepY = aimVector.y / this.aimBallCount;
    for (let i = 1; i <= this.aimBalls.length; i++) {
      this.scheduleOnce(() => {
        this.aimBalls[i - 1].setPosition(
          this.ballNode.getPosition().add(new Vec3(stepX * i, stepY * i, 0))
        );
      }, 0.1 - 0.01 * i);
    }
  }

  resetBall(): void {
    this.ballNode.setPosition(0, 0);
    this.ballNode.getComponent(RigidBody2D).linearVelocity = new Vec2(0, 0);
    this.ballNode.active = false;
  }

  onDisableBallControll(newVal): void {
    if (newVal) {
      this.disableTouch();
    } else {
      this.resetBall();
      this.enableTouch();
    }
  }
}
