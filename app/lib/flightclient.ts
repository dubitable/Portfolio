import { getRoute, getStates, getToken } from "~/.server/flights";
import {
  AccessSchema,
  FlightsSchema,
  RouteSchema,
  type Route,
} from "../schemas/flights";

export class FlightClient {
  access: string | undefined;

  public hasAccess() {
    return this.access !== undefined;
  }

  public async getStates() {
    if (!this.hasAccess()) await this.getAccess();
    if (!this.access) return [];

    const response = await getStates(this.access);

    if (!response) return [];

    const parsed = FlightsSchema.safeParse(response);
    if (!parsed.success) return [];

    return parsed.data.states;
  }

  public async getAccess() {
    const response = await getToken();
    if (!response) return;

    const parsed = AccessSchema.safeParse(response);
    if (!parsed.success) return;

    this.access = parsed.data.access_token;
  }

  private parseRoute(route: any): Route | undefined {
    const parsed = RouteSchema.safeParse(route);
    if (!parsed.success) return undefined;
    return parsed.data;
  }

  public async getRoute(callsign: string) {
    const data = await getRoute(callsign);

    if (!data) return;

    const departure = this.parseRoute(data?.departure);
    const arrival = this.parseRoute(data?.arrival);

    if (!departure || !arrival) return;

    return { departure, arrival };
  }
}
