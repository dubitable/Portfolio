import Gradient from "javascript-color-gradient";

const getGradient = (value: string) =>
  new Gradient()
    .setColorGradient("#FFFFFF", value)
    .setMidpoint(100)
    .getColors();

const colors = {
  background: {
    published: "bg-purple-100",
    saved: "bg-emerald-100",
    warn: "bg-yellow-100",
    temp: "bg-red-100",
    button: "bg-indigo-100",
    gray: "bg-gray-100",
  },
  text: {
    published: "text-purple-600",
    saved: "text-emerald-700",
    warn: "text-yellow-600",
    temp: "text-red-700",
    button: "text-indigo-700",
    gray: "text-gray-700",
  },
  point: {
    published: "#9333ea",
    saved: "#047857",
    warn: "#ca8a04",
    temp: "#b91c1c",
    button: "#4338cc",
    gray: "#374151",
  },
  gradient: {
    published: getGradient("#9333ea"),
    saved: getGradient("#047857"),
    warn: getGradient("#ca8a04"),
    temp: getGradient("#b91c1c"),
    button: getGradient("#4338cc"),
    gray: getGradient("#374151"),
  },
};

export default colors;
