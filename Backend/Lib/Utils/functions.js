const BASE = process.env.SUPABASE_URL;
const BUCKET = "avatars";

export function createHandle(fullName) {
  const firstName = fullName.trim().split(" ")[0];
  const random = Math.floor(Math.random() * 1e8);
  return `@${firstName}${random}`;
}

export const toPublicUrl = (path) =>
  `${BASE}/storage/v1/object/public/${BUCKET}${path}`;
