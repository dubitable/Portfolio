import type { Team } from "@prisma/client";
import Boxplot from "../Chart/Boxplot";
import type { SelectedColumn } from "../../../routes/projects/venncbb";
import Search from "./Search";
import type { State } from "../../../lib/venncbb";

const access = (team: Team, selectedColumn: keyof Team) => {
  const value = team[selectedColumn];

  if (typeof value == "number") return value;
  else return null;
};

const filter = (values: { group: string; value: number | null }[]) => {
  return values.filter((elem) => elem.value != null) as {
    group: keyof Team;
    value: number;
  }[];
};

const Data = ({
  teams,
  colState,
  keys,
}: {
  teams: Team[];
  colState: State<SelectedColumn>;
  keys: string[];
}) => {
  const [selectedColumn, _] = colState;

  const plot = selectedColumn ? (
    <Boxplot
      data={filter(
        teams.map((team) => {
          return {
            group: (selectedColumn as string).replaceAll("_", " "),
            value: access(team, selectedColumn),
          };
        })
      )}
    />
  ) : (
    <div></div>
  );

  return (
    <div className="flex h-screen flex-1 flex-col justify-start border-e border-gray-100 bg-white w-[20rem] gap-5">
      <div className="flex flex-row justify-center items-center mt-5 text-medium text-gray-900 border-b-2 pb-2 border-gray-100">
        Visualization
      </div>
      <Search valueState={colState as State<string | undefined>} keys={keys} />

      <div className="w-full h-full cursor-pointer">{plot}</div>
    </div>
  );
};

export default Data;
