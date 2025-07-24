import { Team } from "@prisma/client";
import { CSVLink } from "react-csv";
import { keys } from "../../../lib/venncbb";

const Export = ({ teams }: { teams: Team[] }) => {
  return (
    <div className="flex h-screen flex-1 flex-col justify-start border-e border-gray-100 bg-white w-[20rem] gap-5">
      <div className="flex flex-row justify-center items-center mt-5 text-medium text-gray-900 border-b-2 pb-2 border-gray-100">
        Export
      </div>
      <div className="w-full h-3/4 flex flex-col justify-start items-cente gap-5 px-2">
        <div className="flex flex-row gap-5">
          <div className="text-gray-800 w-[10rem]"> File Type </div>
          <select
            name="Mode"
            id="Mode"
            defaultValue={"csv"}
            className="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm text-gray-800"
          >
            <option value="csv">CSV</option>
          </select>
        </div>
        <CSVLink data={teams} filename="venncbb_export.csv">
          <div className="flex flex-row justify-center w-full text-gray-900">
            <div className="rounded border-blue-200 border-solid border-2 px-2 py-1">
              Download {teams.length} Rows / {keys(teams[0]).length} Columns
            </div>
          </div>
        </CSVLink>
      </div>
    </div>
  );
};

export default Export;
