import { getFlagIconClass, normalizeCountryCode } from "@/data/countryCodes.js";

/**
 * Renders a real flag from `flag-icons` using an ISO alpha-2 code.
 * Example: code "BD" → class "fi fi-bd"
 */
export function CountryFlag({ code, className = "", title }) {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return null;

  return (
    <span
      className={`${getFlagIconClass(normalized)} inline-block h-3.5 w-5 shrink-0 rounded-xs bg-cover bg-center align-middle ${className}`.trim()}
      title={title || normalized}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
    />
  );
}
