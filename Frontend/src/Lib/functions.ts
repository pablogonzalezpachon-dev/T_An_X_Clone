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
