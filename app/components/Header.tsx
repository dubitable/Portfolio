import { Link } from "react-router";
import SideMenu from "./SideMenu";
import { useState } from "react";

const Links = () => {
  return (
    <ul className="flex items-center gap-6 text-sm">
      <li>
        <a
          className="text-gray-500 transition hover:text-gray-500/75"
          href="/about#aboutme"
        >
          About
        </a>
      </li>

      <li>
        <a
          className="text-gray-500 transition hover:text-gray-500/75"
          href="/pierreq-resume.pdf"
          target="_blank"
        >
          Resume
        </a>
      </li>

      <li>
        <a
          className="text-gray-500 transition hover:text-gray-500/75"
          href="/neural"
        >
          Neural Playground
        </a>
      </li>

      <li>
        <a
          className="text-gray-500 transition hover:text-gray-500/75"
          href="/classifiers"
        >
          Classifiers
        </a>
      </li>

      <li>
        <a
          className="text-gray-500 transition hover:text-gray-500/75"
          href="/writing"
        >
          Academic Writing
        </a>
      </li>

      <li>
        <a
          href="/blog"
          className="text-gray-500 transition hover:text-gray-500/75"
        >
          Blog
        </a>
      </li>
    </ul>
  );
};

const Header = ({ username }: { username?: string }) => {
  const [sideMenu, setSideMenu] = useState(false);
  return (
    <header className="bg-white">
      {sideMenu && <SideMenu turnOffSideMenu={() => setSideMenu(false)} />}
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="block text-teal-600">
          <span className="sr-only">Home</span>
          <img src="/favicon.ico" width={30} height={30} className="rounded" />
        </Link>

        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav aria-label="Global" className="hidden md:block">
            <Links />
          </nav>

          <div className="flex items-center gap-4">
            <div className="sm:flex sm:gap-4">
              {username ? (
                <div
                  onClick={() => {}}
                  className="block rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700 cursor-default"
                >
                  {username}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
                >
                  Login
                </Link>
              )}
            </div>

            <div className="md:hidden flex items-center justify-center">
              <button
                className={`hamburger hamburger--spin block rounded md:hidden ${
                  sideMenu ? "is-active" : ""
                }`}
                type="button"
                onClick={() => setSideMenu(!sideMenu)}
              >
                <span className="hamburger-box">
                  <span className="hamburger-inner"></span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
