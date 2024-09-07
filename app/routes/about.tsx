import { json, LoaderFunctionArgs, TypedResponse } from "@vercel/remix";
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { getUserInfo } from "~/.server/auth";
import Footer, { socials } from "~/components/Footer";
import Header from "~/components/Header";
import { getSession } from "~/helpers/sessions";
import ProfileIcon from "~/components/icons/ProfileIcon";
import EducationIcon from "~/components/icons/EducationIcon";
import CodeIcon from "~/components/icons/CodeIcon";
import BasketballIcon from "~/components/icons/BasketballIcon";
import WorldIcon from "~/components/icons/WorldIcon";
import LinkIcon from "~/components/icons/LinkIcon";
import { useEffect, useRef, useState } from "react";
import SkiIcon from "~/components/icons/SkiIcon";
import Modal from "~/components/Modal";

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

//#TODO About Page

type AboutMe = {
  title: string;
  text: string;
  desc: string;
  image: string;
  icon: () => JSX.Element;
  extra?: () => JSX.Element;
};

const aboutMes = [
  {
    title: "About Me",
    text: "Hey there! I'm Pierre Quereuil, an aspiring software engineer and current student. My parents are French but I grew up in San Francisco, California - and now I'm in Durham, NC. I'd recommend starting out with my blog if you're interested in what I build!",
    desc: "Pierre Louis Clyde Quereuil",
    image: "/about/linkedin.jpeg",
    icon: () => <ProfileIcon />,
  },
  {
    title: "Education",
    text: "I'm currently a sophomore (class of '27) at Duke University studying Computer Science, planning on double majoring with Statistical Science. Being completely unbiased, I can guarantee that it's the best college ever.",
    desc: "Computer Science @ Duke University",
    image: "/about/duke.jpeg",
    icon: () => <EducationIcon />,
  },
  {
    title: "Experience",
    text: "I have substantial practical and academic experience in areas all across software development and much more. My main interests include web/app development, machine learning, and data science.",
    desc: "Fullstack Web Dev, Systems, AI",
    image: "/about/un.jpeg",
    icon: () => <CodeIcon />,
    extra: () => (
      <a href="/Resume.pdf" download className="underline text-blue-500">
        Download Resume
      </a>
    ),
  },
  {
    title: "Teams",
    text: "I'm a massive sports fan in basketball and soccer, from tenting for weeks to watch Duke-UNC to getting up for the French National Team's World Cup / Euro games with crazy time differences. It's all so worth it.",
    desc: "Blue Devils, Warriors, Les Bleus",
    image: "/about/sports.jpeg",
    icon: () => <BasketballIcon />,
  },
  {
    title: "Hobbies",
    text: "I think I'd qualify myself as an outside person - I'm not often happier than when I'm speeding down slopes in deep powder or finding a super cool viewpoint in another country. Relaxing and reading Camus or playing Titanfall 2 might be exceptions though.",
    desc: "Skiing, Traveling, Philosophy",
    image: "/about/ski.jpeg",
    icon: () => <SkiIcon />,
  },
  {
    title: "Links",
    text: "Here's some platforms that I'm on - otherwise, feel free to contact me at pierrequereuil@gmail.com.",
    desc: "Github, LinkedIn, Instagram",
    image: "/about/sleep.jpg",
    icon: () => <LinkIcon />,
    extra: () => (
      <ul className="flex flex-col justify-center mx-10 mt-2 gap-2">
        {socials.map((social, index) => {
          return (
            <li key={index} className="flex justify-center">
              <a
                href={social.href}
                target="_blank"
                className="flex justify-center gap-2"
              >
                {social.icon()}
                <div className="underline text-blue-500">{social.name}</div>
              </a>
            </li>
          );
        })}
        <li>
          <a href="/Resume.pdf" download className="underline text-blue-500">
            Download Resume
          </a>
        </li>
      </ul>
    ),
  },
];

const Frame = ({ aboutMe }: { aboutMe: AboutMe }) => {
  const { title, text, image, extra } = aboutMe;
  return (
    <div className="flex items-center gap-4">
      <img src={image} alt="" className="size-52 rounded-lg object-cover" />

      <div>
        <h3 className="text-lg/tight font-bold text-gray-900 ">{title}</h3>

        <p className="mt-0.5 text-gray-700">{text}</p>
        {extra ? extra() : null}
      </div>
    </div>
  );
};

const Preview = ({
  aboutMe,
  jump,
  setCurrent,
  border,
}: {
  aboutMe: AboutMe;
  jump?: string;
  setCurrent: (current: string) => void;
  border?: string;
}) => {
  const { title, icon, desc } = aboutMe;

  return (
    <a
      className="block rounded-xl border border-gray-100 p-4 shadow-sm hover:border-gray-200 hover:ring-1 hover:ring-gray-200"
      href={jump ? "#" + jump : undefined}
      onClick={() => (jump ? setCurrent(jump) : null)}
      style={{ border }}
    >
      <span className="inline-block rounded-lg bg-gray-50 p-3">{icon()}</span>

      <h2 className="mt-2 font-bold">{title}</h2>

      <div className="hidden sm:mt-1 sm:block sm:text-sm sm:text-gray-600">
        {desc}
      </div>
    </a>
  );
};

const ModalFrame = ({ aboutMe }: { aboutMe: AboutMe }) => {
  const { title, text, image, extra } = aboutMe;
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <img src={image} alt="" className="size-40 rounded-lg object-cover" />

      <div className="flex flex-col justify-center items-center align-middle gap-2">
        <h3 className="text-lg/tight font-bold text-gray-900 ">{title}</h3>

        <p className="mt-0.5 text-gray-700">{text}</p>
        {extra ? extra() : null}
      </div>
    </div>
  );
};
const About = () => {
  const user = useLoaderData<typeof loader>();
  const ref = useRef<HTMLDivElement>(null);

  const location = useLocation();

  const [frameWidth, setFrameWidth] = useState<number>();
  const [slide, setSlide] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setSlide(location.hash.replace("#", ""));
  }, []);

  useEffect(() => {
    const { innerWidth } = window;

    if (innerWidth <= 640) {
      setFrameWidth(innerWidth);
      return setIsMobile(true);
    }

    const width = ref.current?.offsetWidth;

    if (width) setFrameWidth(width);
  }, [ref]);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {" "}
      {modalOpen && (
        <Modal
          setIsOpen={setModalOpen}
          children={
            <ModalFrame
              aboutMe={
                aboutMes.find(
                  (aboutMe) =>
                    aboutMe.title.replace(" ", "").toLowerCase() == slide
                ) ?? aboutMes[0]
              }
            />
          }
        />
      )}
      <div className="h-screen bg-white flex flex-col justify-between align-items scroll-smooth">
        <Header username={user.username} />
        <div className="flex justify-center">
          <section>
            <div className="smax-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
              <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:items-center lg:gap-x-16">
                {!isMobile && (
                  <div className="mx-auto max-w-lg text-center lg:mx-0 ltr:lg:text-left rtl:lg:text-right">
                    <div
                      className="flex overflow-scroll snap-x scroll-smooth"
                      ref={ref}
                    >
                      {aboutMes.map((aboutMe, index) => (
                        <div
                          className="flex snap-center scroll-smooth"
                          id={aboutMe.title.toLowerCase().replace(" ", "")}
                          style={{ minWidth: frameWidth }}
                          key={index}
                        >
                          {frameWidth ? <Frame aboutMe={aboutMe} /> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {aboutMes.map((aboutMe, index) => {
                    const jump = aboutMe.title.toLowerCase().replace(" ", "");
                    return (
                      <div
                        key={index}
                        onClick={() => (isMobile ? setModalOpen(true) : null)}
                      >
                        <Preview
                          aboutMe={aboutMe}
                          jump={jump}
                          setCurrent={setSlide}
                          border={slide == jump ? "solid blue 1px" : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default About;