import Footer from "~/components/general/Footer";
import Header from "~/components/general/Header";

import { Route } from "./+types/list";

import { getUserInfo } from "~/.server/auth";
import { getSession } from "~/lib/sessions";
import ProjectCard, { Project } from "~/components/general/ProjectCard";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("userId");

  if (!userId) return { loggedIn: false };

  const username = await getUserInfo(userId);

  return { loggedIn: true, userId, username };
};

const projects: Project[] = [
  {
    name: "Flight Tracker",
    subtitle:
      "Live Flight Tracking and Route Information using Amadeus and OpenSky APIs",
    desc: "",
    date: "Jun 18, 2025",
    categories: "Three JS, API",
    href: "/projects/flights",
    src: "/projects/flights.png",
  },
  {
    name: "Neural Networks",
    subtitle:
      "A neural network playground to better understand machine learning.",
    desc: "",
    date: "Aug 20, 2024",
    categories: "Machine Learning, Neural Network, AI",
    href: "/projects/neural",
    src: "/projects/neural.png",
  },
  {
    name: "Classifiers",
    subtitle:
      "Multiple hand-trained Tensorflow classification machine learning models shipped with Gradio.",
    desc: "",
    date: "Aug 29, 2024",
    categories: "AI, Tensorflow, Gradio",
    href: "/projects/classifiers",
    src: "/projects/classifiers.png",
  },
];

const Projects = ({ loaderData }: Route.ComponentProps) => {
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

export default Projects;
