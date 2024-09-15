import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  TypedResponse,
} from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import Footer from "~/components/Footer";
import Header from "~/components/Header";

type LoaderData = {
  loggedIn: boolean;
  username?: string;
  userId?: string;
};

export const loader = async ({}: LoaderFunctionArgs): Promise<
  TypedResponse<LoaderData>
> => {
  return redirect("/blog");
};

export const meta: MetaFunction = () => {
  return [{ title: "Home | Pierre Quereuil" }];
};

const Index = () => {
  const user = useLoaderData<typeof loader>();
  return (
    <div className="h-screen bg-white flex flex-col justify-between align-items">
      <Header username={user.username} />
      <div className="flex justify-center">
        <h2 className="text-black font-extrabold text-3xl">
          welcome {user.username ?? ""}
        </h2>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
