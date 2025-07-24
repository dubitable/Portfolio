import { ResponsiveBoxPlot } from "@nivo/boxplot";

const Boxplot = ({ data }: { data: { value: number }[] }) => {
  return (
    <ResponsiveBoxPlot
      data={data}
      isInteractive={false}
      margin={{ top: 20, right: 30, bottom: 50, left: 70 }}
      minValue={Math.min(...data.map((elem) => elem.value))}
      maxValue={Math.max(...data.map((elem) => elem.value))}
      borderRadius={2}
      quantiles={[0, 0.25, 0.5, 0.75, 1]}
      medianColor={{ from: "color", modifiers: [["darker", 0.3]] }}
      whiskerColor={{ from: "color", modifiers: [["darker", 0.3]] }}
      axisBottom={null}
    />
  );
};

export default Boxplot;
