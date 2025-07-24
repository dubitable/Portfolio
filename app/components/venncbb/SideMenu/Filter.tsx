import type { Team } from "@prisma/client";
import { applyFilters, type State } from "../../../lib/venncbb";
import Search from "./Search";
import TempFilterCondition from "./TempFilterCondition";
import type { Filter as DataFilter } from "../../../routes/projects/venncbb";
import FilterCondition from "./FilterCondition";
import VennDiagram from "../Chart/VennDiagram";

const Filter = ({
  colState,
  keys,
  teams,
  filtersState,
}: {
  colState: State<string | undefined>;
  keys: string[];
  teams: Team[];
  filtersState: State<DataFilter[]>;
}) => {
  const [filters, setFilters] = filtersState;
  const [col, _] = colState;

  return (
    <div className="flex h-screen flex-1 flex-col justify-start items-center border-e border-gray-100 bg-white w-[20rem] gap-2">
      <div className="flex flex-row justify-center items-center mt-5 text-medium text-gray-900 border-b-2 mb-3 pb-2 border-gray-100 w-full">
        Filter
      </div>

      <Search valueState={colState} keys={keys} />
      <div>
        <VennDiagram teams={teams} restrictions={filters} />
      </div>
      <div className="text-sm/8 font-medium tracking-widest text-black">
        {applyFilters(teams, filters).length}/{teams.length}
      </div>

      <div className="w-full h-3/4 cursor-pointer overflow-scroll">
        {filters.map(({ column, max, min }, index) => (
          <FilterCondition
            column={column}
            max={max}
            min={min}
            key={index}
            removeFilter={() =>
              setFilters([
                ...filters.filter((filter) => column != filter.column),
              ])
            }
          />
        ))}
      </div>

      <TempFilterCondition
        colState={colState}
        teams={teams}
        addFilter={(filter: DataFilter) => {
          setFilters([
            ...filters.filter((filter) => col != filter.column),
            filter,
          ]);
        }}
      />
    </div>
  );
};

export default Filter;
