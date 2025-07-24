import { useEffect, useRef } from "react";
import * as d3 from "d3";

import { applyNAMEMAP } from "../../../lib/maps";

// @ts-ignore
import { VennDiagram as VennDiagramJS } from "../../../lib/venn/venn";

import type { Team } from "@prisma/client";
import { Filter } from "../../../routes/projects/venncbb";

function powerset<T>(set: T[]) {
  const res: { index: number; value: T }[][] = [];

  for (let i = 1; i < 1 << set.length; i++) {
    const subset: { index: number; value: T }[] = [];

    for (let j = 0; j < set.length; j++) {
      if ((i >> j) & 1) {
        subset.push({ index: j, value: set[j] });
      }
    }
    res.push(subset);
  }

  return res;
}

type Memo<T> = {
  res: T[];
  next: Record<number, Memo<T>>;
};

function createSets(teams: Team[], restrictions: Filter[]) {
  const memo: Memo<Team> = { res: teams, next: {} };

  const sets = powerset(restrictions).map((subRestrictions) => {
    function applyRestrictions(teams: Team[], current: Memo<Team>, i = 0) {
      if (i == subRestrictions.length) return teams;

      const { value, index } = subRestrictions[i];
      const { max, min, column } = value;

      const filtered = teams.filter((elem) => {
        const item = elem[column as keyof Team] as number;
        return min <= item && max >= item;
      });

      current.next[index] = {
        res: filtered,
        next: {},
      };

      return applyRestrictions(filtered, current.next[index], i + 1);
    }

    const filteredTeams = applyRestrictions(teams, memo);

    return {
      sets: subRestrictions.map((elem) =>
        applyNAMEMAP(restrictions[elem.index].column)
      ),
      size: filteredTeams.length,
      teams: filteredTeams,
    };
  });

  return [
    ...sets,
    { sets: ["ALL"], size: teams.length, teams },
    ...sets.map((set) => {
      return {
        sets: ["ALL", ...set.sets],
        size: set.size,
        teams: set.teams,
      };
    }),
  ];
}

const VennDiagram = ({
  teams,
  restrictions,
}: {
  teams: Team[];
  restrictions: Filter[];
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (teams.length == 0) return;

    const sets = createSets(teams, restrictions);

    const chart = VennDiagramJS(200, 200);
    d3.select(ref.current).datum(sets).call(chart);
  }, [restrictions, teams]);

  return <div ref={ref} />;
};

export default VennDiagram;
