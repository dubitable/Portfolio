import { json, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserInfo } from "~/.server/auth";
import { getSession } from "~/sessions";

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
    <div className="h-screen bg-slate-700 flex justify-center items-center">
      <h2 className="text-blue-200 font-extrabold text-5xl">
        welcome {user.username ?? ""}
      </h2>
    </div>
  );
};

export default Index;
