import axios from "axios";
import { createContext, useState, type ReactNode } from "react";

axios.defaults.withCredentials = true;

type Auth = {
  authenticated: boolean;
};
export const AuthContext = createContext({} as Auth);

type Props = {
  children: ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ authenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
