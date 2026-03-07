export type {
  Katakana,
  KatakanaReadings,
  KatakanaMeanings,
  KatakanaStrokeData,
} from "./types";
export {
  getPrimaryMeaning,
  getPrimaryReading,
  meaningsToArray,
  readingsToArray,
} from "./utils/katakanaText";
export { listKatakanas, getKatakana, getKatakanaStrokes } from "./api/katakanaApi";
