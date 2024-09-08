const Select = <Option extends string>({
  title,
  options,
  onSelect,
  defaultValue,
  disabled,
  disableIcon,
}: {
  title: string;
  options: Option[];
  onSelect: (option: Option) => void;
  defaultValue?: string;
  disabled?: boolean;
  disableIcon?: boolean;
}) => {
  return (
    <div>
      {!disableIcon && (
        <label htmlFor={title} className="block text-sm text-gray-900">
          {title}
        </label>
      )}

      <select
        name={title}
        id={title}
        onChange={(event) => onSelect(event.target.value as Option)}
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
