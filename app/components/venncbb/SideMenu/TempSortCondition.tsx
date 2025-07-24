import ArrowIcon from "../../../components/icons/venncbb/ArrowIcon";
import type { OrderBy } from "../../../routes/projects/venncbb";
import { type State } from "../../../lib/venncbb";
import { useState } from "react";
import type { Team } from "@prisma/client";
import { Tooltip } from "react-tooltip";
import Stat from "../Misc/Stat";

const TempSortCondition = ({
  colState,
  orderByState,
}: {
  colState: State<string | undefined>;
  orderByState: State<OrderBy[]>;
}) => {
  const [selectedColumn, setSelectedColumn] = colState;

  const [orderBy, setOrderBy] = orderByState;

  const [dir, setDir] = useState<"asc" | "desc">("desc");

  if (!selectedColumn || orderBy.find(({ id }) => id == selectedColumn))
    return <div></div>;

  return (
    <div className="flex flex-row bg-gray-600 rounded p-3 justify-between my-2">
      <div className="bg-gray-400 rounded h-full w-8 cursor-pointer"></div>

      <div className="flex flex-row justify-center items-center gap-3">
        <Tooltip anchorSelect={`.${selectedColumn}`} place="top">
          {selectedColumn.replaceAll("_", " ")}
        </Tooltip>
        <div className="text-nowrap overflow-clip w-[4rem]">
          <Stat name={selectedColumn} />
        </div>
        <div
          className="size-5 cursor-pointer"
          onClick={() => setDir(dir == "asc" ? "desc" : "asc")}
        >
          <ArrowIcon orientation={dir} />
        </div>
      </div>

      <div
        className="size-7 text-green-300 cursor-pointer"
        onClick={() => {
          setOrderBy([...orderBy, { id: selectedColumn as keyof Team, dir }]);
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

export default TempSortCondition;
