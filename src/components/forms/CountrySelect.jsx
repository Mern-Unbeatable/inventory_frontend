import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag.jsx";

/**
 * Country dropdown with real flag-icons flags + name + code.
 * Matches existing Select styling; used where native <option> cannot render CSS flags.
 */
export function CountrySelect({
  id,
  label,
  error,
  hint,
  options = [],
  placeholder = "Select a country",
  value = "",
  onChange,
  disabled = false,
  className = "",
  containerClassName = "",
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value) || null;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectOption = (optionValue) => {
    onChange?.({ target: { value: optionValue } });
    setOpen(false);
  };

  return (
    <div className={containerClassName} ref={rootRef}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
          className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 pr-9 text-left text-sm text-slate-900
            focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40
            disabled:bg-slate-50 disabled:text-slate-500
            ${error ? "border-red-400" : "border-slate-300"}
            ${className}`}
        >
          {selected ? (
            <>
              <CountryFlag code={selected.code || selected.value} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {selected.name || selected.label}{" "}
                <span className="font-mono text-slate-500">
                  ({selected.code || selected.value})
                </span>
              </span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </button>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">
                No countries available
              </li>
            ) : (
              options.map((option) => {
                const isActive = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                        isActive ? "bg-slate-50 font-medium text-slate-900" : "text-slate-700"
                      }`}
                      onClick={() => selectOption(option.value)}
                    >
                      <CountryFlag
                        code={option.code || option.value}
                        className="shrink-0"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {option.name || option.label}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {option.code || option.value}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
