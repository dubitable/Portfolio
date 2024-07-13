export const pointColors = [
  "purple",
  "green",
  "red",
  "blue",
  "gray",
  "yellow",
] as const;

export const pointColorMap = {
  purple: "published",
  green: "saved",
  red: "temp",
  yellow: "warn",
  blue: "button",
  gray: "gray",
} as const;

export type PointColor = keyof typeof pointColorMap;

export type TrainingData = {
  x: number;
  y: number;
  color: PointColor;
}[];

export type HeatData = {
  x: number;
  y: number;
  color: PointColor;
  value: number;
}[];

export type HeatMapDims = {
  width: number;
  height: number;
  pageX: number;
  pageY: number;
};
