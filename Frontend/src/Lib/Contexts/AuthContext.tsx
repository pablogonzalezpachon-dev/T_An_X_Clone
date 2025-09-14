import { createContext, useState, type ReactNode } from "react";

type Auth = {
  followed: boolean;
  setFollowed: React.Dispatch<React.SetStateAction<boolean>>;
  followers: number;
  setFollowers: React.Dispatch<React.SetStateAction<number>>;
  following: number;
  setFollowing: React.Dispatch<React.SetStateAction<number>>;
};
export const AuthContext = createContext({} as Auth);

type Props = {
  children: ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const [followed, setFollowed] = useState<boolean>(false);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);

  return (
    <AuthContext.Provider
      value={{
        followed,
        setFollowed,
        followers,
        setFollowers,
        following,
        setFollowing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
