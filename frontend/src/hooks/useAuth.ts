import { createContext, useContext } from "react";
import type { User } from "../types";

export interface AuthContextValue {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
});

export function useAuth() {
  return useContext(AuthContext);
}
