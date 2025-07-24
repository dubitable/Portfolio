import { type State } from "../../../lib/venncbb";
import { Tooltip } from "react-tooltip";
import Stat from "../Misc/Stat";
import { useEffect, useState } from "react";
import type { Team } from "@prisma/client";
import type { Filter } from "../../../routes/projects/venncbb";

const TempFilterCondition = ({
  colState,
  teams,
  addFilter,
}: {
  colState: State<string | undefined>;
  teams: Team[];
  addFilter: (val: Filter) => void;
}) => {
  const [selectedColumn, setSelectedColumn] = colState;

  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  useEffect(() => {
    const mapped = teams
      .map((elem) => elem[selectedColumn as keyof Team])
      .filter((elem) => elem != null) as number[];

    if (typeof mapped[0] == "string") return;
    if (mapped.length == 0) return;

    setMin(Math.floor(Math.min(...mapped)).toFixed(0));
    setMax(Math.ceil(Math.max(...mapped)).toFixed(0));
  }, [teams, selectedColumn]);

  if (!selectedColumn) return <div></div>;

  return (
    <div className="flex flex-row bg-gray-600 rounded p-3 justify-between items-center my-2 w-full cursor-pointer">
      <Tooltip anchorSelect={`.${selectedColumn}`} place="top">
        {selectedColumn.replaceAll("_", " ")}
      </Tooltip>
      <div className="text-nowrap overflow-clip w-[4rem] flex flex-row">
        <Stat name={selectedColumn} />
      </div>
      <input
        value={min}
        className="w-[3rem]"
        onChange={(e) => setMin(e.currentTarget.value)}
      />
      <input
        value={max}
        className="w-[3rem]"
        onChange={(e) => setMax(e.currentTarget.value)}
      ></input>

      <Tooltip place="top" anchorSelect=".magic">
        Championship Winners Min/Max
      </Tooltip>
      <div
        className="size-5 text-purple-400 cursor-pointer magic"
        onClick={() => {
          const mapped = teams
            .filter(({ Tournament_Winner_ }) => Tournament_Winner_ == "Yes")
            .map((elem) => elem[selectedColumn as keyof Team])
            .filter((elem) => elem != null) as number[];

          if (typeof mapped[0] == "string") return;
          if (mapped.length == 0) return;

          setMin(Math.floor(Math.min(...mapped)).toFixed(0));
          setMax(Math.ceil(Math.max(...mapped)).toFixed(0));
        }}
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 576 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"></path>
        </svg>
      </div>

      <div
        className="size-7 text-green-300 cursor-pointer"
        onClick={() => {
          addFilter({
            column: selectedColumn,
            min: Number(min),
            max: Number(max),
            apply: function (team) {
              const value = team[selectedColumn as keyof Team] as number;
              return Number(min) <= value && Number(max) >= value;
            },
          });
          setSelectedColumn(undefined);
        }}
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M256 48C141.125 48 48 141.125 48 256s93.125 208 208 208 208-93.125 208-208S370.875 48 256 48zm107 229h-86v86h-42v-86h-86v-42h86v-86h42v86h86v42z"></path>
        </svg>
      </div>
    </div>
  );
};

export default TempFilterCondition;
