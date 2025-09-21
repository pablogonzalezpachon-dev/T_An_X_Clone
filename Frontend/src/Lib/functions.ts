const BASE = import.meta.env.VITE_SUPABASE_URL;

export function isValidDate(year: number, month: number, day: number): boolean {
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }

  return age >= 15;
}

const COMMON_PASSWORDS = new Set([
  "123456",
  "123456789",
  "qwerty",
  "password",
  "111111",
  "12345678",
  "abc123",
  "1234567",
  "password1",
  "123123",
  "000000",
]);

type PasswordCheck = {
  valid: boolean;
  errors: string[];
};

export function validatePassword(pwd: string): PasswordCheck {
  const errors: string[] = [];
  const hasMinLength = pwd.length >= 8; // minimum length
  const hasLower = /[a-z]/.test(pwd); // a–z
  const hasUpper = /[A-Z]/.test(pwd); // A–Z
  const hasNumber = /\d/.test(pwd); // 0–9
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd); // symbols
  const hasNoSpaces = !/\s/.test(pwd);
  const notCommon = !COMMON_PASSWORDS.has(pwd.toLowerCase());

  // Collect messages for failed requirements
  if (!hasMinLength) errors.push("At least 8 characters.");
  if (!hasLower) errors.push("Include a lowercase letter.");
  if (!hasUpper) errors.push("Include an uppercase letter.");
  if (!hasNumber) errors.push("Include a number.");
  if (!hasSpecial) errors.push("Include a special character (e.g. !@#$%).");
  if (!hasNoSpaces) errors.push("No spaces.");
  if (!notCommon) errors.push("Avoid common/guessable passwords.");

  // "Relatively strong": length OK + at least 4 of the 5 character classes
  const classesPassed = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
    Boolean
  ).length;
  const valid =
    hasMinLength &&
    hasNoSpaces &&
    notCommon &&
    classesPassed >= 3; /* relax or 4 for stricter */

  return { valid, errors };
}

export function validateEmail(email: string) {
  const re =
    /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
  return re.test(email);
}

export function formatJoinedMonthYear(
  date: string,
  opts?: {
    locale?: string; // e.g. 'en-US', 'es-ES'
    timeZone?: string; // e.g. 'America/Guayaquil', 'UTC'
  }
): string {
  const { locale = "en-US", timeZone = "America/Guayaquil" } = opts ?? {};
  const d = new Date(date);

  const formatted = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(d);

  return `${formatted}`;
}

export function timeAgo(
  date: string,
  opts: {
    locale?: string;
    timeZone?: string;
  }
) {
  const { locale, timeZone } = opts;
  const d = new Date(date);
  const now = new Date();

  const secondsAgo = Math.floor((now.getTime() - d.getTime()) / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);
  const monthsAgo = Math.floor(daysAgo / 30);

  let timeString = "";
  if (secondsAgo < 60) {
    timeString = `${secondsAgo} s`;
  } else if (minutesAgo < 60) {
    timeString = `${minutesAgo} m`;
  } else if (hoursAgo < 24) {
    timeString = `${hoursAgo} h`;
  } else if (now.getFullYear === d.getFullYear) {
    timeString = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "2-digit",
      timeZone,
    }).format(d);
  } else {
    timeString = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone,
    }).format(d);
  }
  return timeString;
}

export function formatTimeDotDate(
  iso: string,
  opts?: { locale?: string; timeZone?: string }
) {
  const { locale = "en-US", timeZone = "UTC" } = opts ?? {};
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(d);

  const date = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric", // ensures "Sep 4" (no leading zero)
    year: "numeric",
    timeZone,
  }).format(d);

  return `${time} · ${date}`;
}

export const autoGrow = (el: HTMLTextAreaElement) => {
  el.style.height = "0px"; // reset
  el.style.height = el.scrollHeight + "px"; // fit content
};

export const toPublicUrl = (path: string, bucket: string) => {
  if (!path) return null;
  return `${BASE}/storage/v1/object/public/${bucket}/${path}`;
};
