import { useEffect, useRef, useState } from "react";
import {
  TrainingData,
  HeatMapDims,
  PointColor,
  pointColorMap,
  pointColors,
  HeatData,
} from "../helpers/heatmap";
import HeatMap from "~/components/HeatMap";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import colors from "~/components/colors/colors";
import { Dataset, Feature } from "~/helpers/dataset";
import {
  Activation,
  ActivationLayer,
  FullyConnectedLayer,
  Loss,
  Matrix,
  Network,
} from "~/helpers/neural";
import ReplayIcon from "~/components/icons/ReplayIcon";
import PlayIcon from "~/components/icons/PlayIcon";
import PauseIcon from "~/components/icons/PauseIcon";
import Select from "~/components/Select";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import {
  LoaderFunctionArgs,
  MetaFunction,
  TypedResponse,
} from "@remix-run/node";
import { getUserInfo } from "~/.server/auth";
import { getSession } from "~/helpers/sessions";

export const meta: MetaFunction = () => {
  return [{ title: "Neural | Pierre Quereuil" }];
};

const maxIndex = (array: number[]) => {
  return array.reduce(
    (prev, curr, currIndex) => {
      const { value } = prev;
      return curr > value ? { value: curr, index: currIndex } : prev;
    },
    { value: array[0], index: 0 }
  );
};

const getCoords = (elem: Element, sub: Element): [number, number] => {
  const elemBound = elem.getBoundingClientRect();
  const subBound = sub.getBoundingClientRect();

  return [
    elemBound.left + elemBound.width / 2 - subBound.left,
    elemBound.top + elemBound.height / 2 - subBound.top,
  ];
};

const learningOptions = ["0.00001", "0.0001", "0.001", "0.003"];
learningOptions.push("0.01", "0.03", "0.1", "0.3", "1", "3", "10");

const activationOptions = ["tanh", "sigmoid", "relu", "linear"] as const;

type LoaderData = {
  loggedIn: boolean;
  username?: string;
  userId?: string;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderData>> => {
  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("userId");

  if (!userId) return json({ loggedIn: false });

  const username = await getUserInfo(userId);

  return json({ loggedIn: true, userId, username });
};

const Neural = () => {
  const user = useLoaderData<typeof loader>();

  const mapRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);

  const [isTraining, setIsTraining] = useState(false);

  const [heatMapDims, setHeatMapDims] = useState<HeatMapDims>();

  const [trainingData, setTrainingData] = useState<TrainingData>(
    Dataset.bunches(200, 2)
  );
  const [heatData, setHeatData] = useState<HeatData>([]);

  const [selectedColor, setSelectedColor] = useState<PointColor>("purple");
  const [selectedFeatures, setSelectedFeatures] = useState([0, 1]);

  const [outputs, setOutputs] = useState(2);

  const [learningRate, setLearningRate] = useState(0.3);
  const [resolution, setResolution] = useState(100);

  type NetJoin = {
    from: [number, number];
    to: [number, number];
    weight?: number;
  }[];

  const [netJoin, setNetJoin] = useState<NetJoin>([]);

  const baseNetwork = () => {
    const net = new Network();
    net.add(new FullyConnectedLayer(selectedFeatures.length, 5));
    net.add(new ActivationLayer(Activation.tanh, Activation.tanhPrime));
    net.add(new FullyConnectedLayer(5, outputs));
    net.add(new ActivationLayer(Activation.tanh, Activation.tanhPrime));

    net.activate(Activation.tanh, Activation.tanhPrime);

    return net;
  };

  useEffect(() => {
    network.layers[0] = new FullyConnectedLayer(
      selectedFeatures.length,
      (network.layers[0] as FullyConnectedLayer).outputSize
    );

    setNetwork(network.copy());
  }, [selectedFeatures]);

  useEffect(() => {
    const index = network.layers.length - 2;
    network.layers[index] = new FullyConnectedLayer(
      (network.layers[index] as FullyConnectedLayer).inputSize,
      outputs
    );
  }, [outputs]);

  const navigate = useNavigate();

  const updateNetJoin = () => {
    if (!netRef.current || !layerRef.current) return;
    const join = [];

    const layers = layerRef.current.children;

    const fcLayers = network.getFCLayers();

    for (let i = 0; i < layers.length - 1; i++) {
      const points = layers[i].children;
      const next = layers[i + 1].children;

      const start = i == 0 ? 0 : 1;
      const end = i == layers.length - 2 ? 0 : 1;

      const weights = fcLayers[i]?.weights.array;

      for (let j = start; j < points.length - start; j++) {
        for (let k = end; k < next.length - end; k++) {
          join.push({
            from: getCoords(points[j], netRef.current),
            to: getCoords(next[k], netRef.current),
            weight:
              i >= fcLayers.length ? undefined : weights[j - start][k - end],
          });
        }
      }
    }

    setNetJoin(join);
  };

  const [network, setNetwork] = useState<Network>(baseNetwork());

  const warnNetworkRunning = () => {
    alert("Reset network to change parameters.");
  };

  useEffect(() => {
    updateNetJoin();
  }, [network, outputs, selectedFeatures]);

  const updateHeatData = async (network: Network, span: Matrix[]) => {
    const predictions = network.predict(span);

    const heatData = predictions.map((prediction, i) => {
      const [x, y] = span[i].array[0];
      const confidences = prediction.array[0].map(Math.abs);
      const { value, index } = maxIndex(confidences);
      return { x, y, value, color: pointColors[index] };
    });

    setHeatData(heatData);

    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const runNetwork = async (net: Network) => {
    const [xTrain, yTrain] = [[], []] as Matrix[][];

    const allFeatures = Feature.all();
    const features = selectedFeatures.map((index) => allFeatures[index]);

    trainingData.forEach(({ x, y, color }) => {
      xTrain.push(
        new Matrix([features.map((feature) => feature.perform(x, y))])
      );
      const index = pointColors.findIndex((elem) => elem == color);
      const array = [...Array(outputs)].map((_, i) => (i == index ? 1 : 0));
      yTrain.push(new Matrix([array]));
    });

    net.use(Loss.mse, Loss.msePrime);

    setNetwork(net);

    const span = Dataset.span(resolution, features);
    const epochs = 100;

    net
      .fit(xTrain, yTrain, epochs, learningRate, async (net) => {
        setNetwork(net);
        await updateHeatData(net, span);
        await new Promise((resolve) => setTimeout(resolve, 1));
      })
      .then(() => setIsTraining(false));
  };

  useEffect(() => {
    function updateSize() {
      if (window.innerWidth <= 768) {
        alert("This neural network playground is not adapted for mobile size.");
        navigate("/");
      }

      if (mapRef.current) {
        const { offsetHeight: height, offsetWidth: width } = mapRef.current;
        const { offsetLeft: pageX, offsetTop: pageY } = mapRef.current;
        setHeatMapDims({ height, width, pageX, pageY });
      }
      updateNetJoin();
    }

    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!isTraining) {
      network?.stopTraining();
    }
  }, [isTraining]);

  return (
    <div className="h-screen bg-white flex flex-col justify-between align-items">
      <Header username={user.username} />
      <div className="flex align-items bg-gray-50 h-full mt-16 mx-8 rounded-lg">
        <div className="flex flex-col w-1/3 m-4 rounded-lg">
          <div className="flex h-1/4 m-1 rounded">
            <div className="flex h-full w-full justify-center text-lg">
              <div className="flex flex-col justify-center text-lg">
                <div>Epoch: {network.epoch}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center h-full m-1 rounded">
            <div
              className="m-1"
              onClick={() => (network.epoch != 0 ? warnNetworkRunning() : null)}
            >
              <Select
                title="Learning Rate"
                options={learningOptions}
                onSelect={(option) => setLearningRate(Number(option))}
                defaultValue={learningRate.toString()}
                disabled={network.epoch != 0}
              />
            </div>
            <div
              className="m-1"
              onClick={() => (network.epoch != 0 ? warnNetworkRunning() : null)}
            >
              <Select
                title="Activation Function"
                options={activationOptions as unknown as string[]} // bad
                disabled={network.epoch != 0}
                onSelect={(option) => {
                  const res = option as (typeof activationOptions)[number]; // also bad

                  res == "tanh"
                    ? network.activate(Activation.tanh, Activation.tanhPrime)
                    : res == "sigmoid"
                    ? network.activate(Activation.sig, Activation.sigPrime)
                    : res == "relu"
                    ? network.activate(Activation.relu, Activation.reluPrime)
                    : network.activate(Activation.lin, Activation.linPrime);

                  setNetwork(network.copy());
                }}
                defaultValue="0.03"
              />
            </div>
            <div
              className="m-1"
              onClick={() => (network.epoch != 0 ? warnNetworkRunning() : null)}
            >
              <Select
                title="Output Resolution"
                options={["Regular", "Low", "High"]}
                onSelect={(option) => {
                  const res = option as "Regular" | "High" | "Low";
                  setResolution(res == "Low" ? 75 : res == "High" ? 125 : 100);
                }}
                defaultValue="0.03"
                disabled={network.epoch != 0}
              />
            </div>
          </div>
          <div className="flex border-dotted h-1/4 m-1 rounded">
            <div className="flex m-5 gap-3 justify-center align-middle">
              {isTraining && (
                <button onClick={() => setIsTraining(false)}>
                  <PauseIcon />
                </button>
              )}
              {!isTraining && (
                <button
                  onClick={() => {
                    setIsTraining(true);
                    runNetwork(network);
                  }}
                >
                  <PlayIcon />
                </button>
              )}

              <button
                onClick={() => {
                  network?.stopTraining();
                  network?.reset();
                  updateHeatData(new Network(), []);
                }}
              >
                <ReplayIcon />
              </button>
            </div>
          </div>
        </div>
        <div className="relative flex w-full m-4 rounded-lg">
          <div
            ref={netRef}
            className="absolute w-full h-full pointer-events-none"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {netJoin.map(({ from, to, weight }, index) => {
                const [x1, y1] = from;
                const [x2, y2] = to;

                const attrs = { x1, y1, x2, y2 };

                return (
                  <line
                    {...attrs}
                    className="cursor-pointer"
                    onClick={() => console.log(weight ?? "no weight")}
                    key={index}
                    style={{ stroke: "blue", strokeWidth: 2 }}
                  ></line>
                );
              })}
            </svg>
          </div>

          <div className="static flex flex-col justify-center align-middle w-1/7 m-3 rounded">
            {Feature.all().map((feature, index) => {
              return (
                <div
                  className="h-full m-3 flex justify-center align-middle rounded-full cursor-pointer text-gray-900 items-center"
                  style={{
                    background: selectedFeatures.includes(index)
                      ? "rgb(229 231 235)"
                      : undefined,
                  }}
                  key={index}
                  onClick={() => {
                    if (isTraining) return warnNetworkRunning();
                    if (network.epoch != 0) return warnNetworkRunning();

                    if (!selectedFeatures.includes(index)) {
                      setSelectedFeatures([...selectedFeatures, index].sort());
                    } else {
                      if (selectedFeatures.length == 1) return;
                      setSelectedFeatures(
                        selectedFeatures.filter((i) => i != index)
                      );
                    }
                  }}
                >
                  {feature.name}
                </div>
              );
            })}
          </div>
          <div className="flex flex-col justify-center w-full rounded">
            <div className="flex flex-col justify-center">
              <div className="flex justify-center h-[10%] gap-3">
                <button
                  className="flex justify-center align-middle"
                  onClick={() => {
                    if (network.layers.length < 6) return;
                    if (network.epoch != 0) return warnNetworkRunning();
                    setNetwork(network.removeFCLayer().copy());
                  }}
                >
                  -
                </button>
                <div className="flex justify-center align-middle"> Layers </div>
                <button
                  className="flex justify-center align-middle"
                  onClick={() => {
                    if (network.layers.length > 32) return;
                    if (network.epoch != 0) return warnNetworkRunning();
                    setNetwork(network.addFCLayer().copy());
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <div
              className="flex flex-row justify-around align-middle h-[90%]"
              ref={layerRef}
            >
              <div className="flex flex-col justify-center align-middle mx-2 gap-1">
                {[...Array(selectedFeatures.length)].map((_, nodeIndex) => {
                  return (
                    <div
                      key={nodeIndex}
                      className="flex justify-center align-middle"
                    >
                      <div
                        key={nodeIndex}
                        className="flex flex-col justify-center align-middle gap"
                      >
                        <div className="flex flex-row justify-center align-middle rounded-full bg-red-500 w-5 h-5 z-50"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {network.getFCLayers().map((layer, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col justify-center align-middle mx-2 gap-1"
                  >
                    <div className="flex justify-center align-middle">
                      <div className="flex flex-col justify-center align-middle gap">
                        <button
                          className="w-5 h-5"
                          onClick={() => {
                            if (layer.outputSize > 12) return;
                            if (network.epoch != 0) return warnNetworkRunning();
                            setNetwork(network.editFCLayer(index, 1).copy());
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {[...Array(layer.outputSize)].map((_, nodeIndex) => {
                      return (
                        <div
                          key={nodeIndex}
                          className="flex justify-center align-middle"
                        >
                          <div
                            key={nodeIndex}
                            className="flex flex-col justify-center align-middle gap"
                          >
                            <div className="flex flex-row justify-center align-middle rounded-full bg-blue-500 w-5 h-5 z-50"></div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-center align-middle">
                      <div className="flex flex-col justify-center align-middle gap">
                        <button
                          className="w-5 h-5"
                          onClick={() => {
                            if (layer.outputSize < 2) return;
                            if (network.epoch != 0) return warnNetworkRunning();
                            setNetwork(network.editFCLayer(index, -1).copy());
                          }}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-col justify-center align-middle mx-2 gap-1">
                {[...Array(outputs)].map((_, nodeIndex) => {
                  return (
                    <div
                      key={nodeIndex}
                      className="flex justify-center align-middle"
                    >
                      <div
                        key={nodeIndex}
                        className="flex flex-col justify-center align-middle gap"
                      >
                        <div className="flex flex-row justify-center align-middle rounded-full bg-red-500 w-5 h-5 z-50"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-1/3 m-4 rounded-lg">
          <div className="flex flex-row justify-center h-1/6 m-2 rounded">
            <div className="flex flex-col justify-center text-lg">
              <div>Error: {network.error.toFixed(3)}</div>
            </div>
          </div>
          <div className="bg-gray-200 h-3/6 m-2 rounded-lg" ref={mapRef}>
            <HeatMap
              data={trainingData}
              setData={setTrainingData}
              heatData={heatData}
              dims={heatMapDims}
              selectedColor={selectedColor}
            />
          </div>
          <div className="flex h-2/6 m-2 rounded">
            <div className="flex flex-col bg-gray-200 w-full m-1 rounded-lg">
              <div className="flex flex-wrap h-3/5">
                {[...Array(outputs)].map((_, index) => {
                  const color = colors.point[pointColorMap[pointColors[index]]];

                  return (
                    <div
                      key={index}
                      className="flex justify-center w-1/3 h-1/2 border-gray-50 rounded-lg"
                      style={{
                        borderWidth:
                          pointColors[index] == selectedColor ? 2 : undefined,
                      }}
                    >
                      <div className="flex flex-col justify-center">
                        <button
                          onClick={() => setSelectedColor(pointColors[index])}
                          className={`rounded-full h-2 w-2`}
                          style={{ backgroundColor: color }}
                        ></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col justify-center align-middle">
                <div className="flex flex-row justify-around align-middle">
                  <button
                    onClick={() => {
                      if (isTraining)
                        return alert("Please pause model to change outputs.");
                      if (outputs == 2) return;
                      setOutputs(outputs - 1);
                    }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      if (outputs == pointColors.length) return;
                      if (isTraining)
                        return alert("Please pause model to change outputs.");
                      setOutputs(outputs + 1);
                    }}
                  >
                    +
                  </button>
                </div>

                <button onClick={() => setTrainingData([])}>clear</button>
              </div>
            </div>

            <div className="flex flex-wrap w-full m-1 rounded-lg">
              <div
                className="flex justify-center border-2 border-gray-50 bg-gray-200 w-1/2 h-1/2 rounded-tl-lg cursor-pointer"
                onClick={() => {
                  setTrainingData(Dataset.bunches(200, outputs));
                }}
              >
                <div className="flex flex-col justify-center text-gray-900">
                  1
                </div>
              </div>
              <div
                className="flex justify-center border-2 border-gray-50 bg-gray-200 w-1/2 h-1/2 rounded-tr-lg cursor-pointer"
                onClick={() => {
                  setTrainingData(Dataset.circles(300, outputs));
                }}
              >
                <div className="flex flex-col justify-center text-gray-900">
                  2
                </div>
              </div>
              <div
                className="flex justify-center border-2 border-gray-50 bg-gray-200 w-1/2 h-1/2 rounded-bl-lg cursor-pointer"
                onClick={() => {
                  setTrainingData(Dataset.waves(300, outputs));
                }}
              >
                <div className="flex flex-col justify-center text-gray-900">
                  3
                </div>
              </div>
              <div
                className="flex justify-center border-2 border-gray-50 bg-gray-200 w-1/2 h-1/2 rounded-br-lg cursor-pointer"
                onClick={() => {
                  setTrainingData(Dataset.random(100, outputs));
                }}
              >
                <div className="flex flex-col justify-center text-gray-900">
                  4
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Neural;
