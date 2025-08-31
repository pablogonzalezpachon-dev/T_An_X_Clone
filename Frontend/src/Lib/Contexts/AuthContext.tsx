import { createContext, useState, type ReactNode } from "react";

type Auth = {
  tIdentifier: string;
  setTIdentifier: (id: string) => void;
};
export const AuthContext = createContext({} as Auth);

type Props = {
  children: ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const [tIdentifier, setTIdentifier] = useState("");

  return (
    <AuthContext.Provider value={{ tIdentifier, setTIdentifier }}>
      {children}
    </AuthContext.Provider>
  );
}
