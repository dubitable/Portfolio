import { Console } from "console";

// @ts-ignore
import Amadeus from "amadeus";

const prod = process.env.PROD == "TRUE";

const testSetup = {
  logger: new Console(process.stdout, process.stderr),
};

const prodSetup = {
  clientId: process.env.AMADEUS_PROD_CLIENT_ID,
  clientSecret: process.env.AMADEUS_PROD_CLIENT_SECRET,
  hostname: "production",
  logger: new Console(process.stdout, process.stderr),
};

const amadeus = new Amadeus(prod ? prodSetup : testSetup);

export const getRoute = async (callsign: string) => {
  const matches = [...callsign.matchAll(/([a-zA-Z].+?)([0-9].+)/gm)][0];

  if (!(matches && matches.length == 3)) return;

  const icaoCode = matches[1];
  const flightNumber = matches[2];

  const airline = await amadeus.referenceData.airlines
    .get({
      airlineCodes: icaoCode,
    })
    .catch((e: any) => console.log(e));

  if (!airline || airline.result.meta.count != 1) {
    return;
  }

  const carrierCode = airline.data[0].iataCode;

  const body = {
    carrierCode,
    flightNumber: flightNumber.toString().trim(),
    scheduledDepartureDate: new Date(Date.now()).toISOString().split("T")[0],
  };

  const response = await amadeus.schedule.flights
    .get(body)
    .catch((e: any) => console.log(e));

  if (!response || response.result.meta.count != 1) {
    return;
  }

  const getAirportInfo = async (keyword: string) => {
    const loc = await amadeus.referenceData.locations
      .get({ subType: "AIRPORT", keyword })
      .catch((e: any) => console.log(e));

    if (!loc) return undefined;

    return loc.data.find(
      (location: { iataCode: string }) => location.iataCode === keyword
    );
  };

  const points = response.data[0]?.flightPoints;

  const dInfo = await getAirportInfo(points[0].iataCode);
  const aInfo = await getAirportInfo(points[1].iataCode);

  const data = {
    departure: {
      iataCode: points[0].iataCode,
      info: dInfo,
      timings: points[0].departure.timings,
    },
    arrival: {
      iataCode: points[1].iataCode,
      info: aInfo,
      timings: points[1].arrival.timings,
    },
  };

  return data;
};

export const getStates = async (token: string) => {
  const response = await fetch("https://opensky-network.org/api/states/all", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return;
  }

  return await response.json();
};

export const getToken = async () => {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.OPEN_SKY_CLIENT_ID!,
    client_secret: process.env.OPEN_SKY_CLIENT_SECRET!,
  });

  const response = await fetch(
    "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  if (!response.ok) {
    return;
  }

  return await response.json();
};
