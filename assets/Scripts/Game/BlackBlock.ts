import {
  _decorator,
  AudioClip,
  AudioSource,
  Collider2D,
  Component,
  Contact2DType,
  Node,
  tween,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("BlackBlock")
export class BlackBlock extends Component {
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
      this._collider.off(
        Contact2DType.BEGIN_CONTACT,
        this.onBeginContact,
        this
      );
    }
  }

  onBeginContact() {
    const currentScale = this.node.getScale();
    tween(this.node)
      .to(0.07, {
        scale: new Vec3(currentScale.x * 0.95, currentScale.y * 0.95, 0),
      })
      .to(0.07, { scale: currentScale })
      .start();
  }
}
