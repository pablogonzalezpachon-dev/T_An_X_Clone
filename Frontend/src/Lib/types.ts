import type { Session, User, WeakPassword } from "@supabase/supabase-js";

export type Auth = {
  user: User;
  session: Session;
  weakPassword?: WeakPassword;
};

export type sessionResponse = {
  user: { data: Auth; exp: number; iat: number };
};
