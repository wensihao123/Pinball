import {
  _decorator,
  AudioClip,
  AudioSource,
  Component,
  director,
  Node,
  resources,
} from "cc";
const { ccclass, property } = _decorator;

const BASE_AUDIO_PATH = "SoundClips/";

@ccclass("AudioManager")
export class AudioManager extends Component {
  private static _instance: AudioManager = null;
  public static getInstance() {
    if (this._instance == null) {
      this._instance = new AudioManager();
    }
    return this._instance;
  }
  private _audioSource: AudioSource = null;
  private _whiteToneCount: number = 0;

  constructor() {
    super();
    const audioManager = new Node();
    audioManager.name = "_AudioManager";
    director.getScene().addChild(audioManager);
    director.addPersistRootNode(audioManager);
    this._audioSource = audioManager.addComponent(AudioSource);
  }

  public resetCounts() {
    this._whiteToneCount = 0;
  }

  public get audioSource() {
    return this._audioSource;
  }

  playWhiteBlockSound() {
    this.playOneShot(`a${this._whiteToneCount + 1}`);
    this._whiteToneCount++;
  }

  playWhiteStringSound() {
    this.playOneShot(`b${this._whiteToneCount + 1}`);
    this._whiteToneCount++;
  }

  playBlackBlockHit() {
    this.playOneShot("d");
  }

  playOneShot(sound: AudioClip | string, volume: number = 1.0) {
    if (sound instanceof AudioClip) {
      this._audioSource.playOneShot(sound, volume);
    } else {
      const soundPath = BASE_AUDIO_PATH + sound;
      resources.load(soundPath, (err, clip: AudioClip) => {
        if (err) {
          console.log(err);
        } else {
          this._audioSource.playOneShot(clip, volume);
        }
      });
    }
  }

  play(sound: AudioClip | string, volume: number = 1.0) {
    if (sound instanceof AudioClip) {
      this._audioSource.stop();
      this._audioSource.clip = sound;
      this._audioSource.play();
      this.audioSource.volume = volume;
    } else {
      const soundPath = BASE_AUDIO_PATH + sound;
      resources.load(soundPath, (err, clip: AudioClip) => {
        if (err) {
          console.log(err);
        } else {
          this._audioSource.stop();
          this._audioSource.clip = clip;
          this._audioSource.play();
          this.audioSource.volume = volume;
        }
      });
    }
  }

  stop() {
    this._audioSource.stop();
  }

  pause() {
    this._audioSource.pause();
  }

  resume() {
    this._audioSource.play();
  }
}
