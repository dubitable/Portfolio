import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("about", "routes/about.tsx"),
  route("writing", "routes/writing.tsx"),
  route("login", "routes/login.tsx"),
  route("classifiers", "routes/classifiers.tsx"),
  route("neural", "routes/neural.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:id", "routes/blog_.$id.tsx"),
  route(
    "/.well-known/appspecific/com.chrome.devtools.json",
    "routes/fallback.tsx"
  ),
  ...prefix("projects", [route("flights", "routes/flights.tsx")]),
] satisfies RouteConfig;
