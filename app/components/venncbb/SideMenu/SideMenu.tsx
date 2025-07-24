import type { Team } from "@prisma/client";
import { keys, type State, applyFilters } from "../../../lib/venncbb";
import Data from "./Data";
import SideMenuReduced from "./Reduced";
import type {
  OrderBy,
  SelectedColumn,
  Filter as DataFilter,
} from "../../../routes/projects/venncbb";
import Sort from "./Sort";
import Filter from "./Filter";
import Settings from "./Settings";
import { Settings as SettingsType } from "../../../lib/venncbb";
import Export from "./Export";

export type SideMenuMode =
  | "filter"
  | "settings"
  | "data"
  | "sort"
  | "red"
  | "export";

const SideMenu = ({
  modeState,
  teams,
  selectedColumnState,
  orderByState,
  filtersState,
  SETTINGS,
}: {
  modeState: State<SideMenuMode>;
  teams: Team[];
  selectedColumnState: State<SelectedColumn>;
  orderByState: State<OrderBy[]>;
  filtersState: State<DataFilter[]>;
  SETTINGS: SettingsType;
}) => {
  const [mode, _] = modeState;
  const [filters, __] = filtersState;
  const [orderBy, ___] = orderByState;

  const objKeys = teams.length > 0 ? keys(teams[0]) : [];

  const amounts = {
    filter: filters.length == 0 ? undefined : filters.length,
    sort: orderBy.length == 0 ? undefined : orderBy.length,
  };

  return (
    <div className="flex">
      <SideMenuReduced modeState={modeState} amounts={amounts} />
      {mode == "settings" && <Settings SETTINGS={SETTINGS} />}
      {mode == "filter" && (
        <Filter
          colState={selectedColumnState as State<string | undefined>}
          keys={objKeys}
          filtersState={filtersState}
          teams={teams}
        />
      )}
      {mode == "sort" && (
        <Sort
          colState={selectedColumnState as State<string | undefined>}
          keys={objKeys}
          orderByState={orderByState}
        />
      )}
      {mode == "data" && (
        <Data
          teams={applyFilters(teams, filters)}
          colState={selectedColumnState}
          keys={objKeys}
        />
      )}
      {mode == "export" && <Export teams={applyFilters(teams, filters)} />}
    </div>
  );
};

export default SideMenu;
