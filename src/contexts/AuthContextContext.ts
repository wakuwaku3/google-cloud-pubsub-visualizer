import { createContext } from "react";
import type { User, Project } from "@/types";

export interface AuthContextType {
  user: User | null;
  projects: Project[];
  selectedProject: Project | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  login: () => void;
  logout: () => void;
  refreshProjects: () => Promise<void>;
  selectProject: (projectId: string) => void;
  refreshAccessToken: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
