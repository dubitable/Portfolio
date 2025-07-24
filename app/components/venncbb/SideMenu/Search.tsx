import { useEffect, useState } from "react";
import { selectableColumn, type State } from "../../../lib/venncbb";

const Search = ({
  valueState,
  keys,
}: {
  valueState: State<string | undefined>;
  keys: string[];
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [value, setValue] = valueState;

  useEffect(() => {
    setSearchValue(value ?? "");
  }, [value]);

  return (
    <div className="flex flex-row justify-center items-center text-small w-full px-5">
      <form autoComplete="off" className="relative w-full">
        <div className="relative w-full">
          <input
            type="text"
            id="Headline"
            list="HeadlineList"
            value={searchValue}
            onChange={(e) => {
              const update = e.currentTarget.value;
              setSearchValue(update);
              if (update == "") setValue(undefined);
              if (keys.includes(update) && selectableColumn(update))
                setValue(update);
            }}
            placeholder="Please select"
            className="mt-0.5 w-full rounded border-gray-300 pe-8 p-3 shadow-sm sm:text-sm border-gray-600 bg-gray-900 text-white [&::-webkit-calendar-picker-indicator]:opacity-0"
          />

          {value ? (
            <span
              className="absolute inset-y-0 right-0 grid place-content-center text-gray-700 text-gray-200 px-2 cursor-pointer border-none"
              onClick={() => setValue(undefined)}
            >
              <svg
                fill="currentColor"
                stroke-Width="0"
                viewBox="0 0 24 24"
                className="size-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
              </svg>
            </span>
          ) : (
            <span className="absolute inset-y-0 right-0 grid place-content-center text-gray-700 text-gray-200 px-2">
              <svg
                stroke="white"
                fill="white"
                className="size-3"
                strokeWidth="0"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
              </svg>
            </span>
          )}
        </div>

        <datalist id="HeadlineList">
          {keys.map((key, index) =>
            selectableColumn(key) ? <option key={index} value={key} /> : null
          )}
        </datalist>
      </form>
    </div>
  );
};

export default Search;
