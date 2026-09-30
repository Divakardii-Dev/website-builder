/** National significant number (digits only, no country calling code). */
export type SignupPhoneCountry = {
  id: string;
  name: string;
  /** ITU-T calling code digits only (no +). */
  dialCode: string;
  minDigits: number;
  maxDigits: number;
};

export const DEFAULT_SIGNUP_PHONE_COUNTRY_ID = "IN";

/** Curated rules for common countries (national length without leading + / country code). */
const RAW_SIGNUP_PHONE_COUNTRIES: SignupPhoneCountry[] = [
  { id: "AU", name: "Australia", dialCode: "61", minDigits: 9, maxDigits: 9 },
  { id: "BD", name: "Bangladesh", dialCode: "880", minDigits: 10, maxDigits: 10 },
  { id: "BE", name: "Belgium", dialCode: "32", minDigits: 9, maxDigits: 9 },
  { id: "BR", name: "Brazil", dialCode: "55", minDigits: 10, maxDigits: 11 },
  { id: "CA", name: "Canada", dialCode: "1", minDigits: 10, maxDigits: 10 },
  { id: "CH", name: "Switzerland", dialCode: "41", minDigits: 9, maxDigits: 9 },
  { id: "CN", name: "China", dialCode: "86", minDigits: 11, maxDigits: 11 },
  { id: "DE", name: "Germany", dialCode: "49", minDigits: 10, maxDigits: 11 },
  { id: "EG", name: "Egypt", dialCode: "20", minDigits: 10, maxDigits: 10 },
  { id: "ES", name: "Spain", dialCode: "34", minDigits: 9, maxDigits: 9 },
  { id: "FR", name: "France", dialCode: "33", minDigits: 9, maxDigits: 9 },
  { id: "GB", name: "United Kingdom", dialCode: "44", minDigits: 10, maxDigits: 10 },
  { id: "ID", name: "Indonesia", dialCode: "62", minDigits: 9, maxDigits: 12 },
  { id: "IN", name: "India", dialCode: "91", minDigits: 10, maxDigits: 10 },
  { id: "IT", name: "Italy", dialCode: "39", minDigits: 9, maxDigits: 10 },
  { id: "JP", name: "Japan", dialCode: "81", minDigits: 10, maxDigits: 11 },
  { id: "KE", name: "Kenya", dialCode: "254", minDigits: 9, maxDigits: 9 },
  { id: "KR", name: "South Korea", dialCode: "82", minDigits: 9, maxDigits: 11 },
  { id: "LK", name: "Sri Lanka", dialCode: "94", minDigits: 9, maxDigits: 9 },
  { id: "MX", name: "Mexico", dialCode: "52", minDigits: 10, maxDigits: 10 },
  { id: "MY", name: "Malaysia", dialCode: "60", minDigits: 9, maxDigits: 10 },
  { id: "NG", name: "Nigeria", dialCode: "234", minDigits: 10, maxDigits: 10 },
  { id: "NL", name: "Netherlands", dialCode: "31", minDigits: 9, maxDigits: 9 },
  { id: "NZ", name: "New Zealand", dialCode: "64", minDigits: 8, maxDigits: 10 },
  { id: "PH", name: "Philippines", dialCode: "63", minDigits: 10, maxDigits: 10 },
  { id: "PK", name: "Pakistan", dialCode: "92", minDigits: 10, maxDigits: 10 },
  { id: "SA", name: "Saudi Arabia", dialCode: "966", minDigits: 9, maxDigits: 9 },
  { id: "SG", name: "Singapore", dialCode: "65", minDigits: 8, maxDigits: 8 },
  { id: "TH", name: "Thailand", dialCode: "66", minDigits: 9, maxDigits: 9 },
  { id: "AE", name: "United Arab Emirates", dialCode: "971", minDigits: 9, maxDigits: 9 },
  { id: "US", name: "United States", dialCode: "1", minDigits: 10, maxDigits: 10 },
  { id: "VN", name: "Vietnam", dialCode: "84", minDigits: 9, maxDigits: 9 },
  { id: "ZA", name: "South Africa", dialCode: "27", minDigits: 9, maxDigits: 9 },
];

export const SIGNUP_PHONE_COUNTRIES: SignupPhoneCountry[] = [...RAW_SIGNUP_PHONE_COUNTRIES].sort(
  (a, b) => a.name.localeCompare(b.name)
);

/**
 * Upper bound for mobile numbers entered as international format on shared
 * inputs (e.g. Forgot Password) that do not have a country selector.
 * Computed as the longest national number plus the longest country dial code
 * plus 1 character for the optional leading "+".
 */
export const MAX_MOBILE_INPUT_LENGTH: number = (() => {
  const maxDial = SIGNUP_PHONE_COUNTRIES.reduce(
    (acc, c) => Math.max(acc, c.dialCode.length),
    0
  );
  const maxNational = SIGNUP_PHONE_COUNTRIES.reduce(
    (acc, c) => Math.max(acc, c.maxDigits),
    0
  );
  return 1 + maxDial + maxNational;
})();

export function getSignupPhoneCountry(id: string): SignupPhoneCountry | undefined {
  return SIGNUP_PHONE_COUNTRIES.find((c) => c.id === id);
}

export function getDefaultSignupPhoneCountry(): SignupPhoneCountry {
  return getSignupPhoneCountry(DEFAULT_SIGNUP_PHONE_COUNTRY_ID) ?? SIGNUP_PHONE_COUNTRIES[0];
}

export function nationalDigitsMessage(country: SignupPhoneCountry): string {
  if (country.minDigits === country.maxDigits) {
    return `Enter ${country.minDigits} digits for ${country.name}.`;
  }
  return `Enter ${country.minDigits}-${country.maxDigits} digits for ${country.name}.`;
}

/** Returns an error message string or null if length is valid. */
export function validateSignupNationalDigits(
  digits: string,
  country: SignupPhoneCountry
): string | null {
  const n = digits.replace(/\D/g, "");
  if (n.length < country.minDigits || n.length > country.maxDigits) {
    return nationalDigitsMessage(country);
  }
  return null;
}

export function toE164Mobile(country: SignupPhoneCountry, nationalDigits: string): string {
  const n = nationalDigits.replace(/\D/g, "");
  return `+${country.dialCode}${n}`;
}
