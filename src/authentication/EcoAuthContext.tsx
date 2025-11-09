import { createContext } from "react";
import type { User } from "../types/data-types";

export type EcoAuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestored: boolean;
  login: (username: string) => Promise<void>;
  logout?: () => void;
  refreshToken?: () => Promise<void>;
  user?: string;
  userName?: string;
  accessToken?: string;
  roles?: string[];
  users: User[];
};

export const EcoAuthContext = createContext<EcoAuthContextType | undefined>(
  undefined,
);
