import { Tooltip } from "react-tooltip";
import Stat from "../Misc/Stat";

const FilterCondition = ({
  column,
  min,
  max,
  removeFilter,
}: {
  column: string;
  min: number;
  max: number;
  removeFilter: () => void;
}) => {
  return (
    <div className="flex flex-row bg-gray-600 rounded p-3 justify-between items-center my-2">
      <Tooltip anchorSelect={`.${column}`} place="top">
        {column.replaceAll("_", " ")}
      </Tooltip>
      <div className="text-nowrap overflow-clip w-[4rem] flex flex-row">
        <Stat name={column} />
      </div>
      <input value={min} className="w-[3rem]" readOnly />
      <input value={max} className="w-[3rem]" readOnly></input>
      <div
        className="size-5 text-red-300 cursor-pointer"
        onClick={() => removeFilter()}
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 448 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path>
        </svg>
      </div>
    </div>
  );
};

export default FilterCondition;
