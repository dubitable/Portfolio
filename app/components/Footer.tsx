import GithubIcon from "./icons/GithubIcon";
import InstaIcon from "./icons/InstaIcon";
import LinkedInIcon from "./icons/LinkedInIcon";

export const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/pqreuil/",
    icon: () => <InstaIcon />,
  },
  {
    name: "Github",
    href: "https://github.com/dubitable",
    icon: () => <GithubIcon />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/pierre-quereuil-49bb61204/",
    icon: () => <LinkedInIcon />,
  },
];

const Social = ({ social }: { social: (typeof socials)[number] }) => {
  return (
    <li>
      <a
        href={social.href}
        rel="noreferrer"
        target="_blank"
        className="text-gray-700 transition hover:opacity-75"
      >
        <span className="sr-only">{social.name}</span>
        {social.icon()}
      </a>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 pb-6 pt-6 sm:px-6 lg:px-8 lg:pt-24">
        <div className="border-gray-100 sm:flex sm:items-center sm:justify-between">
          <ul className="flex flex-wrap justify-center gap-4 text-xs lg:justify-end">
            <li>
              <a
                href="/about"
                className="text-gray-500 transition hover:opacity-75"
              >
                Who Am I?
              </a>
            </li>

            <li>
              <a
                href="/blog"
                className="text-gray-500 transition hover:opacity-75"
              >
                What Can I Build?
              </a>
            </li>

            <li>
              <a
                href="/neural"
                className="text-gray-500 transition hover:opacity-75"
              >
                Something Cool
              </a>
            </li>
          </ul>

          <ul className="flex justify-center gap-6 sm:mt-5 lg:justify-end">
            {socials.map((social, index) => (
              <div key={index}>
                <Social social={social} />
              </div>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
