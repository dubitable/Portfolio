import { Team } from "@prisma/client";
import { DATASELECT } from "~/lib/maps";
import { OrderBy } from "~/routes/projects/venncbb";
import prisma from "./prisma";

export const fetchTeams = async (
  orderBys: OrderBy[],
  select: Partial<Record<keyof Team, boolean>>
) => {
  const orderBy = (orderBys ?? []).map(({ id, dir }) => {
    return { [id]: dir };
  });

  const result = await prisma.team.findMany({
    orderBy,
    where: { NOT: { Full_Team_Name: null }, Season: { lte: 2024 } },
    select: select ?? DATASELECT.REDUCED,
  });

  return result;
};
