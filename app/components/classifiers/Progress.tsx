import { capitalize } from "~/lib/string";
import PlusIcon from "../icons/PlusIcon";
import { JSX } from "react";

const Progress = ({
  classifiers,
  current,
  setCurrent,
}: {
  classifiers: {
    name: string;
    icon: () => JSX.Element;
    desc: string;
  }[];
  current: string;
  setCurrent: (current: string) => void;
}) => {
  return (
    <div>
      <h2 className="sr-only">Classifier List</h2>

      <div>
        <ol className="flex justify-center divide-x divide-gray-100 overflow-hidden rounded-lg border border-gray-100 text-sm text-gray-500">
          {classifiers.map(({ name, icon, desc }, index) => {
            return (
              <li
                className="relative flex items-center justify-center gap-2 p-4 cursor-pointer"
                style={{
                  background: current == name ? "rgb(249 250 251)" : undefined,
                  width: `${(1 / (classifiers.length + 1)) * 100}%`,
                }}
                onClick={() => setCurrent(name)}
                key={index}
              >
                <span className="absolute -left-2 top-1/2 hidden size-4 -translate-y-1/2 rotate-45 border border-gray-100 sm:block ltr:border-b-0 ltr:border-s-0 ltr:bg-white rtl:border-e-0 rtl:border-t-0 rtl:bg-gray-50"></span>

                <span className="absolute -right-2 top-1/2 hidden size-4 -translate-y-1/2 rotate-45 border border-gray-100 sm:block ltr:border-b-0 ltr:border-s-0 ltr:bg-gray-50 rtl:border-e-0 rtl:border-t-0 rtl:bg-white"></span>

                {icon && icon()}

                <p className="leading-none">
                  <strong className="block font-medium">
                    {capitalize(name)}
                  </strong>
                  <small className="mt-1"> {desc} </small>
                </p>
              </li>
            );
          })}
          <li
            className="relative flex items-center justify-center gap-2 p-4 cursor-pointer"
            style={{
              background: current == "custom" ? "rgb(249 250 251)" : undefined,
              width: `${(1 / (classifiers.length + 1)) * 100}%`,
            }}
            onClick={() => setCurrent("custom")}
          >
            <div className="size-6">
              <PlusIcon />
            </div>
            <p className="leading-none">
              <strong className="block font-medium">Custom</strong>
              <small className="mt-1"> Add your own! </small>
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Progress;
