import type { Session, User, WeakPassword } from "@supabase/supabase-js";

export type Auth = {
  user: User;
  session: Session;
  weakPassword?: WeakPassword;
};

export type sessionResponse = {
  user: { data: Auth; exp: number; iat: number };
};

export type UserProfile = {
  avatar: string;
  bio: string;
  day_birth: string;
  email: string;
  id: string;
  location: string;
  main_photo: string;
  month_birth: string;
  name: string;
  t_identifier: string;
  year_birth: string;
};
