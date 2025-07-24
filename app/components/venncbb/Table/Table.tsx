import type { Team } from "@prisma/client";
import { Tooltip } from "react-tooltip";
import type { SelectedColumn, OrderBy } from "../../../routes/projects/venncbb";
import {
  entries,
  keys,
  selectableColumn,
  type State,
  Settings,
} from "../../../lib/venncbb";
import ArrowIcon from "../../../components/icons/venncbb/ArrowIcon";
import { createRef, RefObject, useEffect, useMemo, type JSX } from "react";
import Paginate, { usePaginate } from "./Paginate";
import Stat from "../Misc/Stat";

const SKIP_COLS = 2;

const Selectable = ({
  children,
  selected,
}: {
  children: JSX.Element;
  selected: boolean;
}) => {
  if (selected)
    return (
      <div className="px-3 py-2 whitespace-nowrap cursor-pointer bg-gray-800">
        {children}
      </div>
    );

  return (
    <div className="px-3 py-2 whitespace-nowrap cursor-pointer hover:bg-gray-800">
      {children}
    </div>
  );
};

const TableEntry = ({
  col,
  value,
  team,
  index,
}: {
  col: keyof Team;
  team: Team;
  index: number;
  value: number | string | null;
}) => {
  let content;

  switch (col) {
    case "Full_Team_Name":
      content = (
        <div
          className="w-[15rem] overflow-clip"
          style={
            team.Tournament_Winner_ == "Yes"
              ? { textDecoration: "underline" }
              : undefined
          }
        >
          {value}
        </div>
      );
      break;

    case "logos":
      content = (
        <div>
          <div className={`logo-${index}`}>
            {team.logos && <img className="size-8" src={team.logos} />}
          </div>
        </div>
      );
      break;

    default:
      content = (
        <div>
          {typeof value == "number" && value.toFixed(0)}
          {typeof value == "string" && value}
          {value == null && "?"}
        </div>
      );
  }

  return <td className="px-3 py-2 whitespace-nowrap">{content}</td>;
};

const Table = ({
  teams,
  orderByState,
  selectedColumnState,
  SETTINGS,
}: {
  teams: Team[];
  orderByState: State<OrderBy[]>;
  selectedColumnState: State<SelectedColumn>;
  SETTINGS: Settings;
}) => {
  const paginate = usePaginate(teams.length, 12);

  const [orderBy, _] = orderByState;
  const [selectedColumn, setSelectedColumn] = selectedColumnState;

  const renderArrow = (key: string) => {
    const value = orderBy.find((elem) => elem.id == key);

    if (value == undefined) return null;

    return <ArrowIcon orientation={value.dir} />;
  };

  const keysList = useMemo(
    () => keys(teams[0] ?? []) as (keyof Team)[],
    [teams]
  );

  const refMap = useMemo(() => {
    const map: Partial<Record<keyof Team, RefObject<HTMLDivElement | null>>> =
      {};
    for (const key of keysList) {
      map[key] = createRef<HTMLDivElement>();
    }
    return map;
  }, [keysList]);

  useEffect(() => {
    if (SETTINGS.scrollTo == "disable") return;
    if (!selectedColumn || !refMap[selectedColumn]) return;

    refMap[selectedColumn].current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedColumn]);

  if (teams.length <= 0) return <div></div>;

  return (
    <div className="flex w-[60rem] overflow-scroll h-screen py-[3rem] justify-center flex-col gap-2">
      {keys(teams[0]).map((key, index) => (
        <Tooltip anchorSelect={`.${key}`} place="top" key={index}>
          {key.replaceAll("_", " ")}
        </Tooltip>
      ))}
      {paginate.slice(teams).map(({ Full_Team_Name, Season }, index) => (
        <Tooltip anchorSelect={`.logo-${index}`} place="left" key={index}>
          {Full_Team_Name} ({Season})
        </Tooltip>
      ))}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-200 divide-gray-700">
          <thead className=" bg-white ltr:text-left rtl:text-right bg-gray-900">
            <tr className="*:font-medium *:text-gray-900 *:text-white *:first:sticky *:first:left-0 *:first:bg-gray-900">
              {keys(teams[0])
                .slice(SKIP_COLS)
                .map((key, index) => (
                  <th
                    key={index}
                    onClick={() => {
                      if (selectableColumn(key)) {
                        setSelectedColumn(key);
                      }
                    }}
                  >
                    <Selectable selected={key == selectedColumn}>
                      <div
                        className="flex flex-row justify-center items-center gap-1"
                        ref={refMap[key]}
                      >
                        <span>
                          <Stat name={key} />
                        </span>
                        <div className="w-2">{renderArrow(key)}</div>
                      </div>
                    </Selectable>
                  </th>
                ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 divide-gray-700">
            {paginate.slice(teams).map((team, teamIndex) => (
              <tr
                className="*:text-gray-900 *:first:sticky *:text-white *:first:left-0 *:first:bg-[#242424]"
                key={teamIndex}
              >
                {entries(team)
                  .slice(SKIP_COLS)
                  .map(([key, value], keyIndex) => (
                    <TableEntry
                      index={teamIndex}
                      key={keyIndex}
                      col={key}
                      team={team}
                      value={value}
                    />
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginate paginate={paginate} />
    </div>
  );
};

export default Table;
