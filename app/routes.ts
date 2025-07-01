import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

const fallback = route(
  "/.well-known/appspecific/com.chrome.devtools.json",
  "routes/fallback.tsx"
);

export default [
  fallback,
  index("routes/index.tsx"),
  route("login", "routes/login.tsx"),
  route("about", "routes/about.tsx"),
  route("writing", "routes/writing.tsx"),

  // blog
  ...prefix("blog", [
    index("routes/blog/list.tsx"),
    route("/:id", "routes/blog/view.tsx"),
  ]),

  // projects
  ...prefix("projects", [
    index("routes/projects/list.tsx"),
    route("neural", "routes/projects/neural.tsx"),
    route("flights", "routes/projects/flights.tsx"),
    route("classifiers", "routes/projects/classifiers.tsx"),
  ]),

  ...prefix("socialpsych", [
    index("routes/socialpsych/index.tsx"),
    route("edit", "routes/socialpsych/edit.tsx"),
  ]),
] satisfies RouteConfig;
