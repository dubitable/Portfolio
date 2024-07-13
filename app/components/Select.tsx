const Select = ({
  title,
  options,
  onSelect,
  defaultValue,
  disabled,
}: {
  title: string;
  options: string[];
  onSelect: (option: (typeof options)[number]) => void;
  defaultValue?: string;
  disabled?: boolean;
}) => {
  return (
    <div>
      <label htmlFor={title} className="block text-sm text-gray-900">
        {title}
      </label>

      <select
        name={title}
        id={title}
        onChange={(event) => onSelect(event.target.value)}
        className="mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm"
        defaultValue={defaultValue}
      >
        {options.map((option, index) => (
          <option key={index} value={option} disabled={disabled}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
