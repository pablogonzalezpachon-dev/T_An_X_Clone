import { create } from "zustand";
import type { Post, UserProfile } from "./types";

type StoreState = {
  activeUser: UserProfile | null;
  setActiveUser: (user: UserProfile | null) => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;
  recommendedProfiles: UserProfile[] | undefined;
  setRecommendedProfiles: (profiles: UserProfile[]) => void;
};

const useStore = create<StoreState>((set) => ({
  activeUser: null,
  setActiveUser: (user: UserProfile | null) => set({ activeUser: user }),
  posts: [],
  setPosts: (posts: Post[]) => set({ posts }),
  users: [],
  setUsers: (users: UserProfile[]) => set({ users }),
  recommendedProfiles: undefined,
  setRecommendedProfiles: (profiles: UserProfile[]) =>
    set({ recommendedProfiles: profiles }),
}));

export default useStore;
