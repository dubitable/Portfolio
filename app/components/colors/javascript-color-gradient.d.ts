declare module "javascript-color-gradient" {
  class Gradient {
    constructor();
    setColorGradient(...colors: string[]): this;
    setMidpoint(midpoint: number): this;
    getColors(): string[];
    getColor(value: number): string;
  }

  export default Gradient;
}
