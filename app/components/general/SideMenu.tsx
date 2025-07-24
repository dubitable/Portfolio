const SideMenu = ({ turnOffSideMenu }: { turnOffSideMenu: () => void }) => {
  return (
    <div className="flex h-screen flex-col justify-between border-e bg-white absolute z-50 w-3/4">
      <div className="px-4 py-6">
        <ul className="mt-6 space-y-1">
          <li>
            <a
              href="/about"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              About Me
            </a>
          </li>

          <li>
            <a
              href="/neural"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Neural Playground
            </a>
          </li>

          <li>
            <a
              href="/classifiers"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              AI Classifiers
            </a>
          </li>
          <li>
            <a
              href="/writing"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Academic Writing
            </a>
          </li>
          <li>
            <a
              href="/blog"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Blog
            </a>
          </li>
        </ul>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
        <a
          href="#"
          className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50"
        >
          <img
            alt=""
            src="/favicon.ico"
            className="size-10 rounded-full object-cover"
          />

          <div>
            <p className="text-xs">
              <strong className="block font-medium">Pierre Quereuil</strong>

              <span> pierrequereuil@gmail.com </span>
            </p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default SideMenu;
