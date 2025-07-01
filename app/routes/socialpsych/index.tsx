import { redirect } from "react-router";
import type { Route } from "./+types/index";
import loading from "/assets/loading.gif";
import { getLinks } from "~/.server/links";

export const loader = async ({}: Route.LoaderArgs) => {
  const links = await getLinks();

  if (links.length <= 0) return;

  const { link } = links[Math.floor(Math.random() * links.length)];
  return redirect(link);
};

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: "Social Psych | Pierre Quereuil" }];
};

const Index = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <img className="h-5 w-5 object-contain" src={loading} alt="Loading" />
    </div>
  );
};

export default Index;
