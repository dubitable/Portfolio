import { getUserInfo } from "~/.server/auth";
import Footer from "~/components/general/Footer";
import Header from "~/components/general/Header";
import { getSession } from "~/lib/sessions";
import { Route } from "./+types/writing";
import ProjectCard, { Project } from "~/components/general/ProjectCard";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("userId");

  if (!userId) return { loggedIn: false };

  const username = await getUserInfo(userId);

  return { loggedIn: true, userId, username };
};

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: "Writing | Pierre Quereuil" }];
};

const projects: Project[] = [
  {
    name: "How Far Will Your Favorite Team Go in NCAA March Madness?",
    subtitle: "STA 221 | Dr. Tackett",
    desc: "Using Advanced College Basketball Metrics to Predict a Perfect Bracket.",
    date: "Apr 28, 2025",
    categories: "Data Science, Sports Analytics",
    href: "/writing/tournament.pdf",
    src: "/writing/basketball.png",
  },
  {
    name: "La Poésie Yoruba et l'Intraduisible",
    subtitle: "FRENCH 432S | Dr. Felwine Sarr",
    desc: "«Que faire de tout ce qui a été dit, raconté, chanté?» - Mohamed Mbougar Sarr",
    date: "Apr 28, 2024",
    categories: "African Languages, Yoruba Poetry, Philosophy and Literature",
    href: "/writing/poesieyoruba.pdf",
    src: "/writing/yoruba.png",
  },
  {
    name: "District Bias in North Carolina",
    subtitle: "CS 216 | Dr. Stephens-Martinez",
    desc: "Introducing a Novel Approach to Identifying Gerrymandered Districts Using Geospatial Data",
    date: "Dec 6, 2024",
    categories: "Geodata, Gerrymandering",
    href: "/writing/districtbias.pdf",
    src: "/writing/gerrymander.png",
  },
  {
    name: "Measuring the Madness",
    subtitle: "STA 199L | Dr. Elijah Meyer",
    desc: "A Statistical Analysis of How Different College Basketball Seeds Performed in the NCAA Tournament from 1985-2019",
    date: "Dec 8, 2023",
    categories: "Data Science, Sports Analytics, Statistics",
    href: "https://sta199-f23-1.github.io/project-f23-1-merge_conflict/report.html",
    src: "/writing/march.png",
  },
];

const Writing = ({ loaderData }: Route.ComponentProps) => {
  return (
    <div className="h-full bg-white flex flex-col justify-between align-items overflow-visible">
      <Header username={loaderData.username} />
      <div className="flex flex-col justify-center gap-10 mx-5 sm:mx-20-">
        {projects.map((project, index) => (
          <div key={index}>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Writing;
