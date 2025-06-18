export class Matrix {
  array: number[][];
  height: number;
  width: number;

  constructor(matrix: number[][]) {
    this.array = matrix;
    this.height = matrix.length;
    this.width = matrix[0].length;
  }

  dims() {
    return [this.array.length, this.array[0].length];
  }

  add(scalar: number) {
    const matrix = this.array.map((row) => row.map((elem) => elem + scalar));
    return new Matrix(matrix);
  }

  sub(scalar: number) {
    return this.add(-scalar);
  }

  mul(scalar: number) {
    const matrix = this.array.map((row) => row.map((elem) => elem * scalar));
    return new Matrix(matrix);
  }

  apply(fn: (elem: number) => number) {
    const matrix = this.array.map((row) => row.map(fn));
    return new Matrix(matrix);
  }

  mulMatrix(other: Matrix) {
    const matrix: number[][] = [];

    if (this.width != other.height) {
      throw new Error("Incompatible dimensions");
    }

    for (let i = 0; i < this.height; i++) {
      const row: number[] = [];
      for (let j = 0; j < other.width; j++) {
        row.push(0);
        for (let k = 0; k < this.width; k++) {
          row[j] += this.array[i][k] * other.array[k][j];
        }
      }
      matrix.push(row);
    }

    return new Matrix(matrix);
  }

  mulMatrixElem(other: Matrix) {
    const matrix: number[][] = this.array.map((row, i) =>
      row.map((elem, j) => elem * other.array[i][j])
    );

    return new Matrix(matrix);
  }

  addMatrix(other: Matrix, fixRow?: number) {
    const matrix: number[][] = this.array.map((row, i) =>
      row.map((elem, j) => elem + other.array[fixRow ?? i][j])
    );

    return new Matrix(matrix);
  }

  subMatrix(other: Matrix, fixRow?: number) {
    const matrix: number[][] = this.array.map((row, i) =>
      row.map((elem, j) => elem - other.array[fixRow ?? i][j])
    );

    return new Matrix(matrix);
  }

  T() {
    const matrix = this.array[0].map((_, c) =>
      this.array.map((_, r) => this.array[r][c])
    );

    return new Matrix(matrix);
  }

  mean() {
    const flat = this.array.flat(2);
    return flat.reduce((prev, curr) => prev + curr, 0) / flat.length;
  }

  static random(height: number, width: number) {
    const matrix: number[][] = [];
    for (let i = 0; i < height; i++) {
      const row: number[] = [];
      for (let j = 0; j < width; j++) {
        row.push(Math.random());
      }
      matrix.push(row);
    }

    return new Matrix(matrix);
  }

  static ones(height: number, width: number) {
    const matrix: number[][] = [];
    for (let i = 0; i < height; i++) {
      const row: number[] = [];
      for (let j = 0; j < width; j++) {
        row.push(1);
      }
      matrix.push(row);
    }

    return new Matrix(matrix);
  }
}

type LayerType = "activation" | "fullyconnected";

class Layer {
  input?: Matrix;
  output?: Matrix;
  type!: LayerType;

  forwardPropagate(input: Matrix): Matrix {
    throw new Error("Method not implemented.");
  }

  backwardPropagate(outputError: Matrix, learningRate: number): Matrix {
    throw new Error("Method not implemented.");
  }
}

export class FullyConnectedLayer implements Layer {
  inputSize: number;
  outputSize: number;
  input?: Matrix;
  output?: Matrix;
  weights: Matrix;
  bias: Matrix;
  type: LayerType;

  constructor(inputSize: number, outputSize: number) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.type = "fullyconnected";
    this.weights = Matrix.random(inputSize, outputSize).sub(0.5);
    this.bias = Matrix.random(1, outputSize).sub(0.5);
  }

  forwardPropagate(input: Matrix) {
    this.input = input;
    this.output = input.mulMatrix(this.weights).addMatrix(this.bias, 0);
    return this.output;
  }

  backwardPropagate(outputError: Matrix, learningRate: number) {
    if (!this.input || !this.output) {
      throw new Error("Not forward propagated yet");
    }

    const inputError = outputError.mulMatrix(this.weights.T());
    const weightsError = this.input.T().mulMatrix(outputError);

    this.weights = this.weights.subMatrix(weightsError.mul(learningRate));

    this.bias = this.bias.subMatrix(outputError.mul(learningRate));

    return inputError;
  }
}

type ActivationFn = (input: Matrix) => Matrix;

export class Activation {
  private constructor() {}

  static tanh(mat: Matrix) {
    return mat.apply(Math.tanh);
  }

  static tanhPrime(mat: Matrix) {
    return mat.apply((x) => 1 - Math.tanh(x) ** 2);
  }

  static sig(mat: Matrix) {
    return mat.apply((x) => 1 / (1 + Math.pow(Math.E, -x)));
  }

  static sigPrime(mat: Matrix) {
    return mat.apply((x) => {
      const sig = 1 / (1 + Math.pow(Math.E, -x));
      return sig * (1 - sig);
    });
  }

  static relu(mat: Matrix) {
    return mat.apply((x) => Math.max(0, x));
  }

  static reluPrime(mat: Matrix) {
    return mat.apply((x) => (x > 0 ? 1 : 0));
  }

  static lin(mat: Matrix) {
    return mat;
  }

  static linPrime(mat: Matrix) {
    return mat.apply(() => 1);
  }
}

export class ActivationLayer implements Layer {
  input?: Matrix;
  output?: Matrix;
  activation: ActivationFn;
  activationPrime: ActivationFn;
  type: LayerType;

  constructor(activation: ActivationFn, activationPrime: ActivationFn) {
    this.type = "activation";
    this.activation = activation;
    this.activationPrime = activationPrime;
  }

  forwardPropagate(input: Matrix) {
    this.input = input;
    this.output = this.activation(input);

    return this.output;
  }

  backwardPropagate(outputError: Matrix) {
    if (!this.input || !this.output) {
      throw new Error("Not forward propagated yet");
    }

    return this.activationPrime(this.input).mulMatrixElem(outputError);
  }
}

type LossFn = (yTrue: Matrix, yPred: Matrix) => number;
type LossPrimeFn = (yTrue: Matrix, yPred: Matrix) => Matrix;

export class Loss {
  private constructor() {}

  static mse(yTrue: Matrix, yPred: Matrix) {
    const res = yTrue
      .subMatrix(yPred)
      .apply((x) => Math.pow(x, 2))
      .mean();

    return res;
  }

  static msePrime(yTrue: Matrix, yPred: Matrix) {
    return yPred
      .subMatrix(yTrue)
      .mul(2)
      .apply((x) => x / (yTrue.height * yTrue.width));
  }
}

type FCLayer = FullyConnectedLayer;

export class Network {
  layers: Layer[];
  epoch!: number;
  error!: number;
  private training!: boolean;

  loss?: LossFn;
  lossPrime?: LossPrimeFn;

  activation?: ActivationFn;
  activationPrime?: ActivationFn;

  constructor() {
    this.layers = [];
    this.reset();
  }

  reset() {
    this.epoch = 0;
    this.error = 0;
    this.layers = this.layers.map((layer) =>
      layer.type == "fullyconnected"
        ? new FullyConnectedLayer(
            (layer as FCLayer).inputSize,
            (layer as FCLayer).outputSize
          )
        : layer
    );
    this.training = false;
  }

  copy() {
    const net = new Network();
    this.layers.forEach((layer) => net.add(layer));
    net.use(this.loss, this.lossPrime);
    net.activate(this.activation, this.activationPrime);
    return net;
  }

  add(layer: Layer) {
    this.layers.push(layer);
  }

  use(loss?: LossFn, lossPrime?: LossPrimeFn) {
    this.loss = loss;
    this.lossPrime = lossPrime;
  }

  activate(activation?: ActivationFn, activationPrime?: ActivationFn) {
    this.activation = activation;
    this.activationPrime = activationPrime;
  }

  predict(input: Matrix[]) {
    return input.map((matrix) =>
      this.layers.reduce((prev, curr) => curr.forwardPropagate(prev), matrix)
    );
  }

  stopTraining() {
    this.training = false;
  }

  removeFCLayer() {
    const { length } = this.layers;
    if (!this.activation || !this.activationPrime) return this;

    this.layers = [
      ...this.layers.slice(0, length - 4),
      ...this.layers.slice(length - 2),
    ];

    return this;
  }

  addFCLayer() {
    const { length } = this.layers;
    if (!this.activation || !this.activationPrime) return this;

    const oSize = (this.layers[length - 2] as FCLayer).inputSize;
    const iSize = (this.layers[length - 4] as FCLayer).outputSize;

    this.layers = [
      ...this.layers.slice(0, length - 2),
      new FullyConnectedLayer(iSize, oSize),
      new ActivationLayer(this.activation, this.activationPrime),
      ...this.layers.slice(length - 2),
    ];

    return this;
  }

  editFCLayer(index: number, nodeChange: number) {
    const { length } = this.layers;

    if (!this.activation || !this.activationPrime) return this;

    const modifyOLayer = this.layers[index * 2] as FCLayer;
    const modifyILayer = this.layers[(index + 1) * 2] as FCLayer;

    const changedSize = modifyOLayer.outputSize + nodeChange;

    this.layers = [
      ...this.layers.slice(0, index * 2),
      new FullyConnectedLayer(modifyOLayer.inputSize, changedSize),
      new ActivationLayer(this.activation, this.activationPrime),
      new FullyConnectedLayer(changedSize, modifyILayer.outputSize),
      new ActivationLayer(this.activation, this.activationPrime),
      ...this.layers.slice((index + 2) * 2),
    ];

    return this;
  }

  getFCLayers() {
    const filtered = this.layers.filter(
      (layer) => layer.type == "fullyconnected"
    ) as FullyConnectedLayer[];
    return filtered.slice(0, filtered.length - 1);
  }

  async fit(
    xTrain: Matrix[],
    yTrain: Matrix[],
    epochs: number,
    learningRate: number,
    callback?: (net: Network) => Promise<void>
  ) {
    if (!this.loss || !this.lossPrime)
      throw new Error("No loss functions declared.");

    const samples = xTrain.length;

    this.training = true;

    for (let i = 0; i < epochs; i++) {
      let err = 0;

      for (let j = 0; j < samples; j++) {
        const output = this.layers.reduce(
          (prev, curr) => curr.forwardPropagate(prev),
          xTrain[j]
        );

        err += this.loss(yTrain[j], output);

        this.layers
          .reverse()
          .reduce(
            (prev, curr) => curr.backwardPropagate(prev, learningRate),
            this.lossPrime(yTrain[j], output)
          );

        this.layers.reverse();
      }

      this.error = err / samples;
      this.epoch += 1;

      if (callback) await callback(this);

      if (!this.training) return;
    }
  }
}

const xor = () => {
  const toMatrix = (array: number[][]) => new Matrix(array);

  const xTrain = [[[0, 0]], [[0, 1]], [[1, 0]], [[1, 1]]].map(toMatrix);
  const yTrain = [[[0]], [[1]], [[1]], [[0]]].map(toMatrix);

  const network = new Network();

  network.add(new FullyConnectedLayer(2, 3));
  network.add(new ActivationLayer(Activation.tanh, Activation.tanhPrime));

  network.add(new FullyConnectedLayer(3, 1));
  network.add(new ActivationLayer(Activation.tanh, Activation.tanhPrime));

  network.use(Loss.mse, Loss.msePrime);
  network.fit(xTrain, yTrain, 1000, 0.1);

  const out = network.predict(xTrain);
  return out;
};
