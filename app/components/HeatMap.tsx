import { ScaleLinear, scaleLinear } from "d3";
import colors from "./colors/colors";
import {
  TrainingData,
  HeatMapDims,
  PointColor,
  HeatData,
  pointColorMap,
} from "~/helpers/heatmap";

type ChartProps = {
  data?: TrainingData;
  dims?: HeatMapDims;
  margin?: number;
  setData?: (data: TrainingData) => void;
  selectedColor?: PointColor;
  heatData?: HeatData;
};

const HeatMap = ({
  data,
  dims,
  setData,
  heatData,
  selectedColor,
}: ChartProps) => {
  if (!data || !dims) {
    return <div />;
  }

  const { width, height, pageX, pageY } = dims;

  const radius = 4;

  const xScale = scaleLinear().domain([-1, 1]).range([0, width]);
  const yScale = scaleLinear().domain([-1, 1]).range([height, 0]);

  return (
    <svg
      width={width}
      height={height}
      onClick={(event) => {
        const x = xScale.invert(event.pageX - pageX);
        const y = yScale.invert(event.pageY - pageY);
        if (setData)
          setData([...data, { x, y, color: selectedColor ?? "purple" }]);
      }}
    >
      <g>
        <Heat
          radius={1}
          data={heatData ?? []}
          xScale={xScale}
          yScale={yScale}
        />
        <Points radius={radius} data={data} xScale={xScale} yScale={yScale} />
      </g>
    </svg>
  );
};

export default HeatMap;

type PointsProps = {
  data: TrainingData;
  xScale: ScaleLinear<number, number, never>;
  yScale: ScaleLinear<number, number, never>;
  radius: number;
};

const Points = ({ data, xScale, yScale, radius = 8 }: PointsProps) => {
  return (
    <g data-testid="Points">
      {data.map(({ x, y, color }, index) => {
        const fill = colors.point[pointColorMap[color]];

        return (
          <circle
            key={index}
            cx={xScale(x)}
            cy={yScale(y)}
            r={radius}
            className={`cursor-pointer`}
            style={{ fill }}
            stroke="white"
            strokeWidth={0.5}
            strokeOpacity={1}
            fillOpacity={0.8}
            onClick={() => console.log({ x, y, fill })}
          />
        );
      })}
    </g>
  );
};

type HeatProps = {
  data: HeatData;
  xScale: ScaleLinear<number, number, never>;
  yScale: ScaleLinear<number, number, never>;
  radius: number;
};

const Heat = ({ data, xScale, yScale, radius = 8 }: HeatProps) => {
  return (
    <g data-testid="Points">
      {data.map(({ x, y, color, value }, index) => {
        const gradient = colors.gradient[pointColorMap[color]];
        const fill = gradient[Math.floor(gradient.length * value)];

        return (
          <circle
            key={index}
            cx={xScale(x)}
            cy={yScale(y)}
            r={radius}
            style={{ fill }}
          />
        );
      })}
    </g>
  );
};
