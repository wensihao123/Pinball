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
import { GameManager } from "../GameManager";
import loadLevelConfig from "../Common/Helpers";
import { Block, LevelConfig, BlockType, Position } from "../Common/Types";
import {
  BLOCK_TYPE_BLACK,
  BLOCK_TYPE_WHITE,
  CLOCK_WISE,
  LOAD_LEVEL,
  MOTION_TYPES,
  RESET_LEVEL,
} from "../Common/constants";
import { GlobalState } from "../GlobalState";
const { ccclass, property } = _decorator;

@ccclass("LevelManager")
export class LevelManager extends Component {
  private globalState: any = null;
  @property(Node)
  WhiteBlocks: Node = null;
  @property(Node)
  BlackBlocks: Node = null;

  //Blocks
  //White
  @property(Prefab)
  WhiteBlockRectPrefab: Prefab = null;
  @property(Prefab)
  WhiteBlockCirclePrefab: Prefab = null;
  @property(Prefab)
  WhiteBlockStringPrefab: Prefab = null;
  @property(Prefab)
  WhiteBlockTriangleRPrefab: Prefab = null;
  //Black
  @property(Prefab)
  BlackBlockRectPrefab: Prefab = null;
  @property(Prefab)
  BlackBlockTriangleRPrefab: Prefab = null;

  private _levelConfig: LevelConfig = null;

  addEventListeners() {
    this.globalState.addListener(LOAD_LEVEL, this.onLoadLevel.bind(this));
    this.globalState.addListener(RESET_LEVEL, this.onResetLevel.bind(this));
  }

  protected onLoad(): void {
    this.globalState = GlobalState.getInstance();
    this.addEventListeners();
    const currentLevel = GameManager.getInstance().currentLevel;
    this.loadLevelConfig(currentLevel);
  }

  update(deltaTime: number) {}

  async loadLevelConfig(level: number) {
    this._levelConfig = (await loadLevelConfig(level)) as LevelConfig;
    this.scheduleOnce(() => {
      this.loadLevel();
    }, 0);
  }

  loadLevel() {
    this.WhiteBlocks.removeAllChildren();
    this.BlackBlocks.removeAllChildren();
    const blocks = this._levelConfig.WhiteBlocks;
    const fixBlocks = this._levelConfig.BlackBlocks;
    const containerWidth = this.WhiteBlocks.getComponent(UITransform).width;
    const containerHeight = this.WhiteBlocks.getComponent(UITransform).height;
    blocks.forEach((block) => {
      this.generateBlock(
        block,
        containerWidth,
        containerHeight,
        BLOCK_TYPE_WHITE
      );
    });
    if (fixBlocks && fixBlocks.length) {
      fixBlocks.forEach((block) => {
        this.generateBlock(
          block,
          containerWidth,
          containerHeight,
          BLOCK_TYPE_BLACK
        );
      });
    }
  }

  onResetLevel() {
    this.loadLevel();
  }

  onLoadLevel() {
    const currentLevel = GameManager.getInstance().currentLevel;
    this.loadLevelConfig(currentLevel);
  }

  generateBlock(
    block: Block,
    containerWidth: number,
    containerHeight: number,
    type: BlockType
  ) {
    const blockPrefab = this[`${block.Prefab}Prefab`] as Prefab;
    const blockNode = instantiate(blockPrefab);
    const blockX = block.Position.x * containerWidth + block.Position.xOffset;
    const blockY = block.Position.y * containerHeight + block.Position.yOffset;
    const targetScaleX = block.Scale.x;
    const targetScaleY = block.Scale.y;
    blockNode.setPosition(blockX, blockY);
    blockNode.setScale(targetScaleX * 0.5, targetScaleY * 0.5);
    if (block.Rotate) {
      blockNode.angle = block.Rotate.Degrees;
    }
    const blockOpacity = blockNode.getComponent(UIOpacity);
    blockOpacity.opacity = 0;
    this.BlackBlocks.addChild(blockNode);
    if (type === BLOCK_TYPE_WHITE) {
      this.globalState.addWhiteBlock(blockNode);
    } else {
      this.globalState.addBlackBlock(blockNode);
    }
    tween(blockNode)
      .to(0.2, { scale: new Vec3(targetScaleX, targetScaleY, 1) })
      .start();
    tween(blockOpacity).to(0.2, { opacity: 255 }).start();
    if (block.Motion) {
      switch (block.Motion.Type) {
        case MOTION_TYPES.ROTATE:
          this.scheduleOnce(() => {
            this.addRotation(
              blockNode,
              block.Motion.Speed,
              block.Motion.Direction === CLOCK_WISE
            );
          }, 0.2);
          break;
        case MOTION_TYPES.PATROL:
          this.scheduleOnce(() => {
            this.addPatrol(
              blockNode,
              block.Motion.Speed,
              block.Motion.AnchorPoints
            );
          }, 0.2);
          break;
        default:
          break;
      }
    }
  }

  addRotation(node: Node, speed: number, clockwise: boolean) {
    tween(node)
      .by(speed, { angle: clockwise ? -360 : 360 })
      .repeatForever()
      .start();
  }

  addPatrol(node: Node, speed: number, anchorPoints: Position[]) {
    const containerWidth = this.WhiteBlocks.getComponent(UITransform).width;
    const containerHeight = this.WhiteBlocks.getComponent(UITransform).height;
    const points = anchorPoints.map((point) => {
      return new Vec3(
        point.x * containerWidth + point.xOffset,
        point.y * containerHeight + point.yOffset,
        0
      );
    });
    points.push(node.getPosition());
    let tweenPatrol = tween(node);
    points.forEach((point) => {
      tweenPatrol = tweenPatrol.to(speed, { position: point });
    });
    tweenPatrol
      .call(() => {
        this.addPatrol(node, speed, anchorPoints);
      })
      .start();
  }
}
