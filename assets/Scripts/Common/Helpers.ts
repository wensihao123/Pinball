import { JsonAsset, resources } from "cc";

const loadLevelConfig = (level: number) => {
  const filePath = `GameConfigs/Level${level}`;
  return new Promise((resolve, reject) => {
    resources.load(filePath, JsonAsset, (err, data: JsonAsset) => {
      if (err) {
        reject;
      } else {
        resolve(data.json);
      }
    });
  });
};

export default loadLevelConfig;
