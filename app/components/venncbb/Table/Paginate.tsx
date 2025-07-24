import { useState } from "react";

export const usePaginate = (elems: number, split: number) => {
  const pages = Math.ceil(elems / split);

  const [page, setPage] = useState(0);

  return {
    next: () => (page >= pages - 1 ? null : setPage(page + 1)),
    prev: () => (page <= 0 ? null : setPage(page - 1)),
    last: () => setPage(pages - 1),
    first: () => setPage(0),
    slice: function <T>(arr: T[]) {
      return arr.slice(page * split, (page + 1) * split);
    },
    page,
    pages,
    setPage,
  };
};

const Paginate = ({
  paginate,
}: {
  paginate: ReturnType<typeof usePaginate>;
}) => {
  const { page, pages, prev, next } = paginate;

  return (
    <div>
      <ul className="flex justify-center gap-3 text-gray-900 dark:text-white noselect">
        <li>
          <a
            onClick={() => prev()}
            className="grid size-8 place-content-center cursor-pointer rounded border border-gray-200 transition-colors hover:bg-gray-50 rtl:rotate-180 dark:border-gray-700 dark:hover:bg-gray-800"
            aria-label="Previous page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>

        <li className="text-sm/8 font-medium tracking-widest">
          {page + 1}/{pages}
        </li>

        <li>
          <a
            onClick={() => next()}
            className="grid size-8 cursor-pointer place-content-center rounded border border-gray-200 transition-colors hover:bg-gray-50 rtl:rotate-180 dark:border-gray-700 dark:hover:bg-gray-800"
            aria-label="Next page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Paginate;
