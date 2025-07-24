import { useState } from "react";
import Modal from "./Modal";

type SliderProps = {
  minState: [number, (val: number) => void];
  maxState: [number, (val: number) => void];
};

const Slider = ({ minState, maxState }: SliderProps) => {
  const [min, setMin] = minState;
  const [max, setMax] = maxState;

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {modalOpen && (
        <Modal setIsOpen={setModalOpen}>
          <div> </div>
        </Modal>
      )}
      <label htmlFor="Min" className="relative">
        <input
          type="number"
          id="Min"
          placeholder=""
          value={min}
          onChange={(e) => setMin(Number(e.currentTarget.value))}
          className="peer mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />

        <span className="absolute inset-y-0 start-3 -translate-y-5 bg-white px-0.5 text-sm font-medium text-gray-700 transition-transform peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5 dark:bg-gray-900 dark:text-white">
          MIN
        </span>
      </label>

      <label htmlFor="Max" className="relative">
        <input
          type="number"
          id="Max"
          placeholder=""
          value={max}
          onChange={(e) => setMax(Number(e.currentTarget.value))}
          className="peer mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />

        <span className="absolute inset-y-0 start-3 -translate-y-5 bg-white px-0.5 text-sm font-medium text-gray-700 transition-transform peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5 dark:bg-gray-900 dark:text-white">
          MAX
        </span>
      </label>
    </>
  );
};

export default Slider;
