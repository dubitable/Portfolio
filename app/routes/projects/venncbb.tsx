import { useEffect, useState } from "react";
import type { Team } from "@prisma/client";
import Table from "../../components/venncbb/Table/Table";
import SideMenu, {
  type SideMenuMode,
} from "../../components/venncbb/SideMenu/SideMenu";
import { DATASELECT } from "../../lib/maps";
import { useSettings, applyFilters } from "../../lib/venncbb";
import { fetchTeams } from "~/.server/venncbb";
import { Route } from "./+types/venncbb";
import { useSubmit } from "react-router";

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: "VennCBB | Pierre Quereuil" }];
};

export type OrderBy = { id: keyof Team; dir: "asc" | "desc" };
export type DataMode = "red" | "full";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();

  const orderBysRaw = formData.get("orderBys");
  const dataMode = formData.get("dataMode") as DataMode;

  let orderBys: OrderBy[] = [];

  try {
    orderBys = JSON.parse(orderBysRaw as string);
  } catch (err) {
    return null;
  }

  const data = await fetchTeams(
    orderBys,
    dataMode === "red" ? DATASELECT.REDUCED : DATASELECT.FULL
  ).catch(() => null);

  return data;
};
export const orderByDefault = { id: "Net_Rating", dir: "desc" } as OrderBy;

export type Restriction = { stat: keyof Team; min: number; max: number };
export type SelectedColumn = keyof Team | undefined;

export type NumFilter = {
  apply: (team: Team) => boolean;
  min: number;
  max: number;
  column: string;
};

export type Filter = NumFilter;

const VennCBB = ({ actionData }: Route.ComponentProps) => {
  const [teams, setTeams] = useState<Team[]>([]);

  const submit = useSubmit();

  const [orderBy, setOrderBy] = useState<OrderBy[]>([orderByDefault]);
  const [filters, setFilters] = useState<Filter[]>([]);

  const [sideMenuMode, setSideMenuMode] = useState<SideMenuMode>("filter");

  const SETTINGS = useSettings({ datamode: "red", scrollto: "auto" });

  const [selectedColumn, setSelectedColumn] = useState<SelectedColumn>();

  useEffect(() => {
    const data = new FormData();
    data.append("orderBys", JSON.stringify(orderBy));
    data.append("dataMode", SETTINGS.dataMode);

    submit(data, { method: "POST" });
  }, [orderBy, SETTINGS.dataMode]);

  useEffect(() => {
    if (actionData) setTeams(actionData);
  }, [actionData]);

  return (
    <div className="w-screen h-screen flex flex-row justify-between bg-[#242424] text-white">
      <SideMenu
        modeState={[sideMenuMode, setSideMenuMode]}
        teams={teams}
        selectedColumnState={[selectedColumn, setSelectedColumn]}
        orderByState={[orderBy, setOrderBy]}
        filtersState={[filters, setFilters]}
        SETTINGS={SETTINGS}
      />

      <div className="">
        <Table
          teams={applyFilters(teams, filters)}
          orderByState={[orderBy, setOrderBy]}
          selectedColumnState={[selectedColumn, setSelectedColumn]}
          SETTINGS={SETTINGS}
        />
      </div>
      <div></div>
    </div>
  );
};

export default VennCBB;
