import { JSX } from "react";

const Modal = ({
  setIsOpen,
  children,
}: {
  setIsOpen: (isOpen: boolean) => void;
  children: JSX.Element;
}) => (
  <div>
    <div
      className="bg-[rgba(0,0,0,0.2)] w-screen h-screen z-0 -translate-x-1/4 -translate-y-1/4 absolute left-1/4 top-1/4"
      onClick={() => setIsOpen(false)}
    ></div>
    <div className="fixed top-1/2 left-1/2 w-3/4 h-3/4 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg">
      {children}
    </div>
  </div>
);

export default Modal;
