import { json, LoaderFunctionArgs, TypedResponse } from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import { getUserInfo } from "~/.server/auth";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { getSession } from "~/helpers/sessions";

type LoaderData = {
  loggedIn: boolean;
  username?: string;
  userId?: string;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderData>> => {
  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("userId");

  if (!userId) return json({ loggedIn: false });

  const username = await getUserInfo(userId);

  return json({ loggedIn: true, userId, username });
};

const Index = () => {
  const user = useLoaderData<typeof loader>();
  return (
    <div className="h-screen bg-white flex flex-col justify-between align-items">
      <Header />
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
