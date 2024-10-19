import {
  _decorator,
  Component,
  EventTouch,
  input,
  Input,
  instantiate,
  Node,
  Prefab,
  RigidBody2D,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

const minSwipeDistance = 50;

@ccclass("BallController")
export class BallController extends Component {
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
  tailBallCount = 9;

  private touchStartPos: Vec2 = new Vec2();
  private touchEndPos: Vec2 = new Vec2();
  private aimBalls: Node[] = [];
  private tailBalls: Node[] = [];
  private pastBallPositions: Vec3[] = [];
  private recordTimeGap = 0.032;
  private recordTimer = 0;

  protected onLoad(): void {
    this.ballNode.active = false;
    this.aimBalls = Array.from({ length: this.aimBallCount }, (_, i) => {
      const aimBall = instantiate(this.aimBallPrefab);
      aimBall.active = false;
      this.ballAimNode.addChild(aimBall);
      return aimBall;
    });
    this.tailBalls = Array.from({ length: this.tailBallCount }, (_, i) => {
      const tailBall = instantiate(this.aimBallPrefab);
      tailBall.active = false;
      this.tailNode.addChild(tailBall);
      tailBall.setScale(new Vec3(1 - 0.05 * i, 1 - 0.05 * i, 1));
      return tailBall;
    });
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  protected update(deltaTime: number) {
    const ballPosition = this.ballNode.getPosition();
    if (
      ballPosition.y < -660 ||
      ballPosition.y > 660 ||
      ballPosition.x < -380 ||
      ballPosition.x > 380
    ) {
      this.ballNode.getComponent(RigidBody2D).linearVelocity = new Vec2(0, 0);
      this.ballNode.active = false;
    }
    this.recordTimer += deltaTime;
    if (this.recordTimer > this.recordTimeGap) {
      if (this.pastBallPositions.length > this.tailBallCount) {
        this.pastBallPositions.shift();
      }
      this.pastBallPositions.push(ballPosition);
      this.recordTimer = 0;
    }
    this.tailBalls.forEach((tailBall, i) => {
      if (this.pastBallPositions.length > this.tailBallCount) {
        tailBall.setPosition(
          this.pastBallPositions[this.tailBallCount - i - 1]
        );
      }
    });
  }

  protected onTouchStart(event: EventTouch): void {
    this.ballNode.active = false;
    this.touchStartPos = event.getLocation();
    const uiTransform = this.node.getComponent(UITransform);
    const localPos = uiTransform.convertToNodeSpaceAR(
      new Vec3(event.getLocation().x, event.getLocation().y, 0)
    );
    this.ballNode.setPosition(localPos);
    this.ballNode.active = true;
    this.ballNode.getComponent(RigidBody2D).linearVelocity = new Vec2(0, 0);
  }

  protected onTouchMove(event: EventTouch): void {
    const currentPos = event.getLocation();
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
    this.touchEndPos = event.getLocation();
    const aimVector = event.getLocation().subtract(this.touchStartPos);
    const ballFlyTime =
      aimVector.length() /
      aimVector.normalize().multiplyScalar(this.ballSpeed).length();
    const timeStep = ballFlyTime / 28 / this.aimBallCount;
    this.aimBalls.forEach((aimBall, i) => {
      this.scheduleOnce(() => {
        aimBall.active = false;
      }, timeStep * i);
    });
    this.tailBalls.forEach((tailBall, i) => {
      tailBall.active = true;
    });
    this.setBallVelocity();
  }

  setBallVelocity(): void {
    const swipeVector = this.touchEndPos.subtract(this.touchStartPos);
    if (swipeVector.length() < minSwipeDistance) {
      this.ballNode.active = false;
      this.tailBalls.forEach((tailBall) => {
        tailBall.active = false;
      });
      return;
    }
    const velocity = swipeVector.normalize().multiplyScalar(this.ballSpeed);
    this.ballNode.getComponent(RigidBody2D).linearVelocity = new Vec2(
      velocity.x,
      velocity.y
    );
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
}
