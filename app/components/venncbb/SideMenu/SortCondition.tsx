import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ArrowIcon from "../../../components/icons/venncbb/ArrowIcon";
import type { OrderBy } from "../../../routes/projects/venncbb";
import { type State } from "../../../lib/venncbb";
import { Tooltip } from "react-tooltip";
import Stat from "../Misc/Stat";

const SortCondition = ({
  dir,
  id,
  orderByState,
}: {
  dir: "asc" | "desc";
  id: string;
  orderByState: State<OrderBy[]>;
}) => {
  const [orderBy, setOrderBy] = orderByState;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex flex-row bg-gray-500 rounded p-3 justify-between my-2"
    >
      <div
        {...listeners}
        className="bg-gray-400 rounded h-6 w-8 cursor-pointer"
      ></div>

      <div className="flex flex-row justify-center items-center gap-3">
        <Tooltip anchorSelect={`.${id}`} place="top">
          {id.replaceAll("_", " ")}
        </Tooltip>
        <div className="text-nowrap overflow-clip w-[4rem]">
          <Stat name={id} />
        </div>
        <div
          className="size-5 cursor-pointer"
          onClick={() =>
            setOrderBy([
              ...orderBy.map((elem) => {
                if (elem.id == id) {
                  return {
                    id,
                    dir: elem.dir == "asc" ? "desc" : "asc",
                  } as OrderBy;
                }
                return elem;
              }),
            ])
          }
        >
          <ArrowIcon orientation={dir} />
        </div>
      </div>

      <div
        className="size-5 text-red-300 cursor-pointer"
        onClick={() => {
          setOrderBy([...orderBy.filter((elem) => elem.id != id)]);
        }}
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 448 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path>
        </svg>
      </div>
    </div>
  );
};

export default SortCondition;
