import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  Node,
} from "cc";
import { GlobalState } from "../GlobalState";
import { AnimManager } from "../Effects/AnimManager";
const { ccclass, property } = _decorator;

@ccclass("WhiteBlock")
export class WhiteBlock extends Component {
  private _collider: Collider2D = null;
  protected onLoad(): void {
    this._collider = this.getComponent(Collider2D);
    if (this._collider) {
      this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    } else {
      console.error("Collider2D not found");
    }
  }

  protected onDestroy(): void {
    if (this._collider) {
      this._collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    this._collider.enabled = false;
    this.scheduleOnce(() => {
      this.node.active = false;
      GlobalState.getInstance().onWhiteBlockHit();
      const pos = this.node.getPosition();
      const scale = this.node.getScale();
      const euler = this.node.eulerAngles;
      AnimManager.getInstance().onPlayRectFrameAnim(pos, scale, euler);
    }, 0);
  }
}
