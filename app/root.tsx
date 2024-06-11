import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@vercel/remix";
import stylesheet from "./tailwind.css?url";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/remix";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesheet }];
};

const App = () => {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <SpeedInsights />
        <Outlet />
      </body>
    </html>
  );
};

export default App;
