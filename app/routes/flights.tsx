import { Route } from "./+types/flights";
import { FlightClient } from "../lib/flightclient";

import type { Route as Departure } from "../schemas/flights";

import Globe from "~/components/flights/Globe.client";
import { JSX, useEffect, useState } from "react";
import { useSubmit } from "react-router";
import { z } from "zod";
import Warning from "~/components/flights/Warning";

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: "Flights | Pierre Quereuil" }];
};

const ActionSchema = z.union([
  z.object({ action: z.literal("flights") }),
  z.object({ action: z.literal("route"), callsign: z.string() }),
]);

const warnings = {
  amadeus:
    "Our provider was not able to retrieve data for this flight, likely because it is non-commercial. You can follow the FlightAware link on the flight number for more information.",
};

export const action = async ({ request }: Route.ActionArgs) => {
  const parsed = ActionSchema.safeParse(await request.json());
  if (parsed.error) return;

  const { data } = parsed;
  const flightclient = new FlightClient();

  if (data.action == "flights") {
    const states = await flightclient.getStates();
    const flights = states.map((state, index) => {
      return {
        lat: state[6] as number,
        lng: state[5] as number,
        color: "red",
        size: 0,
        callsign: state[1] as string | null,
        index,
      };
    });
    return { flights };
  } else if (data.action == "route") {
    const route = await flightclient.getRoute(data.callsign);

    if (route) return { route };
    else {
      return { warning: warnings.amadeus };
    }
  }

  return undefined;
};

const Flights = ({ actionData }: Route.ComponentProps) => {
  const [content, setContent] = useState<JSX.Element | undefined>();
  const submit = useSubmit();

  const updateFlights = () => {
    submit(
      { action: "flights" },
      { method: "post", encType: "application/json" }
    );
  };

  const getRoute = (callsign: string) => {
    submit(
      { action: "route", callsign },
      { method: "post", encType: "application/json" }
    );
  };

  const [warning, setWarning] = useState<string | undefined>();
  const [fData, setfData] = useState<
    {
      lat: number;
      lng: number;
      color: string;
      size: number;
      callsign: string | null;
      index: number;
    }[]
  >([]);
  const [route, setRoute] = useState<
    { arrival: Departure; departure: Departure } | undefined
  >();

  useEffect(() => {
    if (actionData?.warning) setWarning(actionData?.warning);
    if (actionData?.flights) setfData(actionData.flights);
    if (actionData?.route) setRoute(actionData?.route);
  }, [actionData]);

  useEffect(() => {
    setContent(
      <Globe
        fData={fData}
        lastUpdated={actionData?.flights ? new Date(Date.now()) : undefined}
        getRoute={getRoute}
        route={route}
        warningState={[warning, setWarning]}
      />
    );
  }, [fData, route]);

  useEffect(() => {
    updateFlights();
  }, []);

  return (
    <>
      {content}
      <>
        {warning ? (
          <Warning
            onClose={() => setWarning(undefined)}
            header="Data Retrieval Error"
          >
            {warning}
          </Warning>
        ) : undefined}
      </>
    </>
  );
};

export default Flights;
