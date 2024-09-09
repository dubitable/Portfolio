import {
  json,
  LoaderFunctionArgs,
  redirect,
  TypedResponse,
} from "@vercel/remix";
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

type Card = {
  name: string;
  className: string;
  desc: string;
  categories: string;
  date: string;
  href: string;
  src: string;
};

const Paper = ({
  paper: { desc, name, className, date, categories, href, src },
}: {
  paper: Card;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      className="relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8"
    >
      <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>

      <div className="sm:flex sm:justify-between sm:gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">{name}</h3>

          <p className="mt-1 text-xs font-medium text-gray-600">{className}</p>
        </div>

        <div className="hidden sm:block sm:shrink-0">
          <img
            alt=""
            src={src}
            className="size-20 rounded-lg object-cover shadow-sm"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-pretty text-sm text-gray-500">{desc}</p>
      </div>

      <dl className="mt-6 flex gap-4 sm:gap-6">
        <div className="flex flex-col-reverse">
          <dt className="text-sm font-medium text-gray-600">{date}</dt>
          <dd className="text-xs text-gray-500">Written</dd>
        </div>

        <div className="flex flex-col-reverse">
          <dt className="text-sm font-medium text-gray-600">{categories}</dt>
          <dd className="text-xs text-gray-500">Categories</dd>
        </div>
      </dl>
    </a>
  );
};

const papers: Card[] = [
  {
    name: "La Poésie Yoruba et l'Intraduisible",
    className: "FRENCH 432S | Dr. Felwine Sarr",
    desc: "«Que faire de tout ce qui a été dit, raconté, chanté?» - Mohamed Mbougar Sarr",
    date: "April 28th, 2024",
    categories: "African Languages, Yoruba Poetry, Philosophy and Literature",
    href: "/writing/poesieyoruba.pdf",
    src: "/writing/yoruba.png",
  },
  {
    name: "Measuring the Madness",
    className: "STA 199L | Dr. Elijah Meyer",
    desc: "A Statistical Analysis of How Different College Basketball Seeds Performed in the NCAA Tournament from 1985-2019.",
    date: "December 8th, 2023",
    categories: "Data Science, Sports Analytics, Statistics",
    href: "https://sta199-f23-1.github.io/project-f23-1-merge_conflict/report.html",
    src: "/writing/march.png",
  },
];

const Writing = () => {
  const user = useLoaderData<typeof loader>();
  return (
    <div className="h-screen bg-white flex flex-col justify-between align-items">
      <Header username={user.username} />
      <div className="flex flex-col justify-center gap-10 mx-5 sm:mx-20">
        {papers.map((paper, index) => (
          <div key={index}>
            <Paper paper={paper} />
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Writing;
