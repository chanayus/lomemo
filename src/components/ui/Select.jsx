import { useState, useRef } from "react";

const Select = ({ options, onChange = () => {}, defaultValue, placeholder = "", label = "" }) => {
  const selectRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selected, setSelected] = useState(defaultValue ?? null);

  const changeSelectValue = (title, value) => {
    onChange(value);
    setShowOptions(false);
    setSelected({ title, value });
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
    document.body.addEventListener(
      "click",
      (e) => {
        if (selectRef.current && e.target instanceof Element && !selectRef.current.contains(e.target)) {
          setShowOptions(false);
        }
      },
      {
        once: false,
      },
    );
  };
  return (
    <div ref={selectRef} className="relative w-full">
      <button onClick={() => toggleOptions()} className="h-full w-full rounded border border-white/10 bg-white/5 p-2">
        <div className="text-left text-xs opacity-50">{label}</div>
        <div className="flex items-center justify-between">
          <div className="truncate text-left text-sm">{selected?.title ?? <div className="opacity-20">{placeholder}</div>}</div>
          <div className="flex h-5 w-5 items-center justify-center rounded">
            <svg xmlns="http://www.w3.org/2000/svg" height="0.8rem" viewBox="0 0 512 512">
              <path
                fill="white"
                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
              />
            </svg>
          </div>
        </div>
      </button>
      {showOptions && (
        <div className="absolute z-20 mt-1.5 flex min-w-full max-w-[15ch] flex-col space-y-1 rounded-md bg-black/90 shadow-xl">
          <div className="max-h-[10rem] overflow-y-auto rounded-md border border-white/10 bg-white/20 p-2">
            {options.map((item, index) => (
              <button
                key={index}
                onClick={() => changeSelectValue(item.title, item.value)}
                className="flex w-full justify-between whitespace-nowrap rounded px-2 py-1 text-left font-light text-white/50 hover:bg-black/30 hover:text-white"
              >
                <p className="truncate">{item.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
