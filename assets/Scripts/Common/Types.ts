import { BLOCK_TYPE_WHITE, BLOCK_TYPE_BLACK } from "./constants";

export type Block = {
  Prefab: string;
  Position: {
    x: number;
    y: number;
    xOffset: number;
    yOffset: number;
  };
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
    Direction: string;
  };
};

export type LevelConfig = {
  WhiteBlocks: Block[];
  BlackBlocks?: Block[];
};

export type BlockType = typeof BLOCK_TYPE_WHITE | typeof BLOCK_TYPE_BLACK;
