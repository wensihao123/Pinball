import { BLOCK_TYPE_WHITE, BLOCK_TYPE_BLACK } from "./constants";

export type Block = {
  Prefab: string;
  Position: Position;
  Scale: {
    x: number;
    y: number;
  };
  Rotate?: {
    Degrees: number;
  };
  Motion?: {
    Type: string;
    Speed: number;
    Direction?: string;
    AnchorPoints?: Position[];
  };
};

export type Position = {
  x: number;
  y: number;
  xOffset: number;
  yOffset: number;
}

export type LevelConfig = {
  WhiteBlocks: Block[];
  BlackBlocks?: Block[];
};

export type BlockType = typeof BLOCK_TYPE_WHITE | typeof BLOCK_TYPE_BLACK;
