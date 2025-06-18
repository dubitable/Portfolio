import { redirect } from "react-router";
import { Route } from "./+types/index";
import Footer from "~/components/Footer";
import Header from "~/components/Header";

export const loader = async ({}: Route.LoaderArgs) => {
  return redirect("/about");
};

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: "Home | Pierre Quereuil" }];
};

const Index = () => {
  return (
    <div className="h-screen bg-white flex flex-col justify-between align-items">
      <Header />
      <div className="flex justify-center">
        <h2 className="text-black font-extrabold text-3xl"></h2>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
