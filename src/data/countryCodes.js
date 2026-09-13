import countriesData from "./countries.json";

/**
 * Full country reference list (name, code, flagCode, dialCode).
 * Extend by adding entries to `countries.json` only.
 */
export const COUNTRIES = countriesData;

/**
 * Reusable ISO 3166-1 alpha-2 country code list.
 */
export const COUNTRY_CODES = COUNTRIES.map((country) => country.code);

/** Normalize a country code to uppercase ISO alpha-2. */
export const normalizeCountryCode = (code) =>
  String(code ?? "")
    .trim()
    .toUpperCase();

/** flag-icons class for a country, e.g. "fi fi-bd". */
export const getFlagIconClass = (codeOrFlagCode) => {
  if (!codeOrFlagCode) return "";
  const lower = String(codeOrFlagCode).trim().toLowerCase();
  const fromList = COUNTRIES.find(
    (country) =>
      country.code.toLowerCase() === lower ||
      country.flagCode.toLowerCase() === lower,
  );
  const flagCode = fromList?.flagCode || lower;
  return `fi fi-${flagCode}`;
};

export const getCountryByCode = (code) => {
  if (!code) return null;
  const normalized = normalizeCountryCode(code);
  return COUNTRIES.find((country) => country.code === normalized) || null;
};

export const getCountryByName = (name) => {
  if (!name) return null;
  const normalized = String(name).trim().toLowerCase();
  return (
    COUNTRIES.find(
      (country) => country.name.trim().toLowerCase() === normalized,
    ) || null
  );
};

/**
 * Options for country selectors: value=code, with name/flagCode/dialCode.
 * @param {{ excludeCodes?: string[] }} [options]
 */
export const getCountrySelectOptions = ({ excludeCodes = [] } = {}) => {
  const excluded = new Set(
    excludeCodes.filter(Boolean).map((code) => normalizeCountryCode(code)),
  );

  return COUNTRIES.filter((country) => !excluded.has(country.code)).map(
    (country) => ({
      value: country.code,
      label: `${country.name} (${country.code})`,
      name: country.name,
      code: country.code,
      flagCode: country.flagCode,
      dialCode: country.dialCode,
      flagClass: getFlagIconClass(country.flagCode),
    }),
  );
};
