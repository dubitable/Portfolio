import type { JSX } from "react";
import { capitalize, type State } from "../../../lib/venncbb";
import FilterIcon from "../../../components/icons/venncbb/FilterIcon";
import DataIcon from "../../../components/icons/venncbb/DataIcon";
import SortIcon from "../../../components/icons/venncbb/SortIcon";
import type { SideMenuMode } from "./SideMenu";

const Option = ({
  children,
  active,
}: {
  children: JSX.Element | JSX.Element[];
  active: boolean;
}) => {
  if (active) {
    return (
      <div className="group relative flex justify-center rounded-sm bg-blue-50 px-2 py-1.5 text-blue-700">
        {children}
      </div>
    );
  }

  return (
    <div className="group relative flex justify-center rounded-sm px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700">
      {children}
    </div>
  );
};

const MenuItem = ({
  modeState,
  name,
  icon,
  amount,
}: {
  modeState: State<SideMenuMode>;
  name: SideMenuMode;
  icon: () => JSX.Element;
  amount?: number;
}) => {
  const [mode, setMode] = modeState;
  return (
    <Option active={mode == name}>
      <div
        onClick={() => setMode(mode == name ? "red" : name)}
        className="cursor-pointer"
      >
        <div className="size-5 opacity-75">
          {icon()}
          <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
            {capitalize(name)}
          </span>
        </div>
        {amount && (
          <div className="absolute right-0 top-0 rounded-4xl bg-red-500 size-3 text-white text-[0.5rem] text-center">
            {amount}
          </div>
        )}
      </div>
    </Option>
  );
};

const SideMenuReduced = ({
  modeState,
  amounts,
}: {
  modeState: State<SideMenuMode>;
  amounts: Partial<Record<SideMenuMode, number>>;
}) => {
  return (
    <div className="flex h-full w-16 flex-col justify-between border-e border-gray-100 bg-white noselect ">
      <div>
        <div className="border-t border-gray-100">
          <div className="px-2">
            <div className="py-4">
              <MenuItem
                modeState={modeState}
                icon={() => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
                name="settings"
              />
            </div>

            <ul className="space-y-1 border-t border-gray-100 pt-4">
              <li>
                <MenuItem
                  modeState={modeState}
                  icon={() => <DataIcon />}
                  name="data"
                />
              </li>

              <li>
                <MenuItem
                  modeState={modeState}
                  icon={() => <FilterIcon />}
                  name="filter"
                  amount={"filter" in amounts ? amounts["filter"] : undefined}
                />
              </li>

              <li>
                <MenuItem
                  modeState={modeState}
                  icon={() => <SortIcon />}
                  name="sort"
                  amount={"sort" in amounts ? amounts["sort"] : undefined}
                />
              </li>

              <li>
                <MenuItem
                  modeState={modeState}
                  icon={() => (
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 576 512"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128zM571 308l-95.7-96.4c-10.1-10.1-27.4-3-27.4 11.3V288h-64v64h64v65.2c0 14.3 17.3 21.4 27.4 11.3L571 332c6.6-6.6 6.6-17.4 0-24zm-379 28v-32c0-8.8 7.2-16 16-16h176V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V352H208c-8.8 0-16-7.2-16-16z"></path>
                    </svg>
                  )}
                  name="export"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenuReduced;
