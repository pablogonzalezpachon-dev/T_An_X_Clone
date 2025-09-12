import type { Session, User, WeakPassword } from "@supabase/supabase-js";

export type Auth = {
  user: User;
  session: Session;
  weakPassword?: WeakPassword;
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
  created_at: string;
  followed: boolean;
  following: number;
  followers: number;
  posts: number;
};

export type Post = {
  id: number;
  content: string;
  date_of_creation: string;
  name: string;
  t_identifier: string;
  user_id: string;
  likes: number;
  active_user_liked: boolean;
  active_user_creator: boolean;
  reply_to: number | null;
  replies: number;
};
