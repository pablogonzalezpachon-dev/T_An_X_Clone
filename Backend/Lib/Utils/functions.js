export function createHandle(fullName) {
  const firstName = fullName.trim().split(" ")[0];
  const random = Math.floor(Math.random() * 1e8);
  return `@${firstName}${random}`;
}
