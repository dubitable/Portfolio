import { DataMode } from "../../../routes/projects/venncbb";
import { ScrollTo, Settings as SettingsType } from "../../../lib/venncbb";

const Settings = ({ SETTINGS }: { SETTINGS: SettingsType }) => {
  const [dataMode, setDataMode] = SETTINGS.dataModeState;
  const [scrollTo, setScrollTo] = SETTINGS.scrollToState;

  return (
    <div className="flex h-screen flex-1 flex-col justify-start border-e border-gray-100 bg-white w-[20rem] gap-5">
      <div className="flex flex-row justify-center items-center mt-5 text-medium text-gray-900 border-b-2 pb-2 border-gray-100">
        Settings
      </div>

      <div className="w-full h-3/4 flex flex-col justify-start items-cente gap-5 px-2">
        <div className="flex flex-row gap-5">
          <div className="text-gray-800 w-[10rem]"> Data Mode </div>
          <select
            name="Mode"
            id="Mode"
            value={dataMode}
            onChange={(e) => setDataMode(e.currentTarget.value as DataMode)}
            className="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm text-gray-800"
          >
            <option value="red">Reduced</option>
            <option value="full">Full</option>
          </select>
        </div>
        {dataMode == "full" && (
          <div className="flex flex-row items-center justify-center gap-2 px-5">
            <div className="text-yellow-400 size-10">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Warning">
                  <g>
                    <g>
                      <path d="M12.5,8.752a.5.5,0,0,0-1,0h0v6a.5.5,0,0,0,1,0Z"></path>
                      <circle cx="11.999" cy="16.736" r="0.5"></circle>
                    </g>
                    <path d="M18.642,20.934H5.385A2.5,2.5,0,0,1,3.163,17.29L9.792,4.421a2.5,2.5,0,0,1,4.444,0L20.865,17.29a2.5,2.5,0,0,1-2.223,3.644ZM12.014,4.065a1.478,1.478,0,0,0-1.334.814L4.052,17.748a1.5,1.5,0,0,0,1.333,2.186H18.642a1.5,1.5,0,0,0,1.334-2.186L13.348,4.879A1.478,1.478,0,0,0,12.014,4.065Z"></path>
                  </g>
                </g>
              </svg>
            </div>
            <div className="text-gray-800 text-sm">
              Some advanced metrics were not computed in earlier years.
            </div>
          </div>
        )}
        <div className="flex flex-row gap-5">
          <div className="text-gray-800 w-[10rem]"> Scroll To</div>
          <select
            name="ScrollTo"
            id="ScrollTo"
            value={scrollTo}
            onChange={(e) => setScrollTo(e.currentTarget.value as ScrollTo)}
            className="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm text-gray-800"
          >
            <option value="auto">Automatic</option>
            <option value="disable">Disable</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;
