import { Matrix } from "./neural";
import { pointColors } from "./heatmap";

export class Dataset {
  private constructor() {}

  static span(size: number, features: Feature[]) {
    const predict: Matrix[] = [];

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const [x, y] = [(i / size - 0.5) * 2, (j / size - 0.5) * 2];
        predict.push(
          new Matrix([features.map((feature) => feature.perform(x, y))])
        );
      }
    }

    return predict;
  }

  static random(size: number, outputs: number) {
    return [...Array(size)].map(() => {
      const color = pointColors[Math.floor(Math.random() * outputs)];
      return {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        color,
      };
    });
  }

  static circles(size: number, outputs: number = 2) {
    const step = 0.8 / outputs;
    let startR = step;

    return [...Array(outputs)]
      .map((_, index) => {
        const color = pointColors[index];

        const bunch = [...Array(Math.floor(size / outputs))].map(() => {
          const T = Math.random() * Math.PI * 2;
          const r = startR;

          return { x: r * Math.cos(T), y: r * Math.sin(T), color };
        });

        startR += step;

        return bunch;
      })
      .reduce((prev, curr) => {
        prev.push(...curr);
        return prev;
      });
  }

  static waves(size: number, outputs: number = 2) {
    let step = 1.5 / outputs;
    let yOffset = (-step * (outputs - 1)) / 2;
    const range = [5, 10];

    return [...Array(outputs)]
      .map((_, index) => {
        const color = pointColors[index];

        const bunch = [...Array(Math.floor(size / outputs))].map(() => {
          const x = Math.random() * range[1] - range[0];
          const y = Math.sin(x) / 3 + yOffset;

          return { x: x / range[0], y, color };
        });

        yOffset += step;
        return bunch;
      })
      .reduce((prev, curr) => {
        prev.push(...curr);
        return prev;
      });
  }

  static bunches(size: number, outputs: number = 2) {
    const bunchSize = 0.5;
    const margin = 0.1;
    let theta = Math.random() * Math.PI * 2;
    const tOffset = Math.PI / (5 * outputs);

    return [...Array(outputs)]
      .map((_, index) => {
        const color = pointColors[index];

        const bunch = [...Array(Math.floor(size / outputs))].map(() => {
          const startT = theta + tOffset;
          const endT = theta + (Math.PI * 2) / outputs - tOffset;

          const T = Math.random() * (endT - startT) + startT;
          const r = (margin + bunchSize) * Math.sqrt(Math.random()) + margin;

          return { x: r * Math.cos(T), y: r * Math.sin(T), color };
        });
        theta += (Math.PI * 2) / outputs;
        return bunch;
      })
      .reduce((prev, curr) => {
        prev.push(...curr);
        return prev;
      });
  }
}

export class Feature {
  name: string;
  perform: (x: number, y: number) => number;

  private constructor(name: string, perform: (x: number, y: number) => number) {
    this.name = name;
    this.perform = perform;
  }

  static all() {
    return [
      new Feature("x", (x, y) => x),
      new Feature("y", (x, y) => y),
      new Feature("x^2", (x, y) => x ** 2),
      new Feature("y^2", (x, y) => y ** 2),
      new Feature("xy", (x, y) => x * y),
      new Feature("sin(x)", (x, y) => Math.sin(x)),
      new Feature("sin(y)", (x, y) => Math.sin(y)),
    ];
  }
}
