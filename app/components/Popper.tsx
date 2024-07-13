const Popper = ({ value }: { value: number }) => {
  return (
    <div
      className="absolute bg-gray-700 text-white w-5 h-2"
      style={{ top: 3, right: 0, width: 100, height: 100 }}
    >
      {value}
    </div>
  );
};

export default Popper;
