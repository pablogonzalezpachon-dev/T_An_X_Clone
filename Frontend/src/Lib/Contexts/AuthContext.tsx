import { createContext, useState, type ReactNode } from "react";

type Auth = {
  followed: boolean;
  setFollowed: React.Dispatch<React.SetStateAction<boolean>>;
  followers: number;
  setFollowers: React.Dispatch<React.SetStateAction<number>>;
  following: number;
  setFollowing: React.Dispatch<React.SetStateAction<number>>;
  followState: boolean;
  setFollowState: React.Dispatch<React.SetStateAction<boolean>>;
  activeUserAvatar: string | null;
  setActiveUserAvatar: React.Dispatch<React.SetStateAction<string | null>>;
};
export const AuthContext = createContext({} as Auth);

type Props = {
  children: ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const [followed, setFollowed] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followState, setFollowState] = useState(false);
  const [activeUserAvatar, setActiveUserAvatar] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        followed,
        setFollowed,
        followers,
        setFollowers,
        following,
        setFollowing,
        followState,
        setFollowState,
        activeUserAvatar,
        setActiveUserAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
