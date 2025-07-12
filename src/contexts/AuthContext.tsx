import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateAuthUrl,
  getAccessToken,
  refreshAccessToken,
  getUserInfo,
  getProjects,
  type TokenResponse,
} from "@/lib/oauth";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface Project {
  projectId: string;
  name: string;
  projectNumber: string;
}

interface AuthContextType {
  user: User | null;
  projects: Project[];
  selectedProject: Project | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshProjects: () => Promise<void>;
  selectProject: (projectId: string) => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時に認証状態をチェック
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 保存されたアクセストークンを確認
        const savedToken = sessionStorage.getItem("access_token");
        const savedRefreshToken = sessionStorage.getItem("refresh_token");
        const savedUser = sessionStorage.getItem("user");
        const savedProjects = sessionStorage.getItem("projects");

        if (savedToken && savedUser) {
          console.log("Found saved authentication data, restoring session...");

          try {
            const userInfo = JSON.parse(savedUser);
            setUser(userInfo);
            setAccessToken(savedToken);

            if (savedRefreshToken) {
              setRefreshToken(savedRefreshToken);
            }

            // プロジェクト一覧も復元
            if (savedProjects) {
              const projectsData = JSON.parse(savedProjects);
              setProjects(projectsData);

              // 選択されたプロジェクトも復元
              const savedProjectId =
                sessionStorage.getItem("selectedProjectId");
              if (savedProjectId && projectsData.length > 0) {
                const projectToSelect = projectsData.find(
                  (p: Project) => p.projectId === savedProjectId
                );
                if (projectToSelect) {
                  setSelectedProject(projectToSelect);
                }
              }
            } else {
              // プロジェクト一覧が保存されていない場合は再取得
              try {
                await refreshProjects(savedToken);
              } catch (error) {
                console.warn("Failed to refresh projects:", error);
                // プロジェクト取得に失敗した場合、トークンが無効かもしれないのでリフレッシュを試行
                if (
                  error instanceof Error &&
                  error.message.includes("401") &&
                  savedRefreshToken
                ) {
                  console.log(
                    "Token appears to be expired, attempting refresh..."
                  );
                  const refreshSuccess = await refreshAccessTokenWithContext();
                  if (!refreshSuccess) {
                    console.log("Token refresh failed, logging out...");
                    logout();
                    return;
                  }
                }
              }
            }
          } catch (error) {
            console.error("Failed to restore session:", error);
            // 復元に失敗した場合はセッションをクリア
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("refresh_token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("projects");
            sessionStorage.removeItem("selectedProjectId");
          }
        } else {
          // URL パラメータから認可コードを取得
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get("code");

          if (code) {
            console.log(
              "Processing authorization code:",
              code.substring(0, 20) + "..."
            );

            // 認可コードがある場合、アクセストークンを取得
            const codeVerifier = sessionStorage.getItem("code_verifier");
            if (codeVerifier) {
              console.log(
                "Found code_verifier:",
                codeVerifier.substring(0, 20) + "..."
              );

              // 認可コードを処理する前に、code_verifier を削除して重複使用を防ぐ
              sessionStorage.removeItem("code_verifier");

              try {
                const tokenResponse = await getAccessToken(code, codeVerifier);
                console.log(
                  "Successfully obtained access token:",
                  tokenResponse.access_token.substring(0, 20) + "..."
                );
                setAccessToken(tokenResponse.access_token);
                sessionStorage.setItem(
                  "access_token",
                  tokenResponse.access_token
                );

                // リフレッシュトークンがあれば保存
                if (tokenResponse.refresh_token) {
                  setRefreshToken(tokenResponse.refresh_token);
                  sessionStorage.setItem(
                    "refresh_token",
                    tokenResponse.refresh_token
                  );
                }

                // ユーザー情報を取得
                const userInfo = await getUserInfo(tokenResponse.access_token);
                setUser(userInfo);
                sessionStorage.setItem("user", JSON.stringify(userInfo));

                // プロジェクト一覧を取得（失敗してもログインは成功とする）
                try {
                  await refreshProjects(tokenResponse.access_token);
                } catch (error) {
                  console.warn(
                    "Failed to fetch projects, but login was successful:",
                    error
                  );
                  // プロジェクト一覧の取得に失敗しても、ログインは成功とする
                }
              } catch (error) {
                console.error("Token exchange failed:", error);
                // エラーが発生した場合は、ログイン画面に戻る
                setUser(null);
                setAccessToken(null);
                sessionStorage.removeItem("access_token");
                sessionStorage.removeItem("user");
              }

              // URL から認可コードを削除
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
            } else {
              console.error("No code_verifier found in sessionStorage");
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshProjects = async (token?: string) => {
    try {
      const projectsData = await getProjects(token || accessToken!);
      setProjects(projectsData);
      sessionStorage.setItem("projects", JSON.stringify(projectsData));

      // プロジェクトが取得できた場合、初期選択を設定
      if (projectsData.length > 0 && !selectedProject) {
        const savedProjectId = sessionStorage.getItem("selectedProjectId");
        const projectToSelect = savedProjectId
          ? projectsData.find((p: Project) => p.projectId === savedProjectId)
          : projectsData[0];

        if (projectToSelect) {
          setSelectedProject(projectToSelect);
          sessionStorage.setItem(
            "selectedProjectId",
            projectToSelect.projectId
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const selectProject = (projectId: string) => {
    const project = projects.find((p) => p.projectId === projectId);
    if (project) {
      setSelectedProject(project);
      sessionStorage.setItem("selectedProjectId", projectId);
    }
  };

  // リフレッシュトークンでアクセストークンを再取得
  const refreshAccessTokenWithContext = async (): Promise<boolean> => {
    if (!refreshToken) {
      console.error("No refresh token available");
      return false;
    }
    try {
      const tokenResponse = await refreshAccessToken(refreshToken);
      setAccessToken(tokenResponse.access_token);
      sessionStorage.setItem("access_token", tokenResponse.access_token);
      if (tokenResponse.refresh_token) {
        setRefreshToken(tokenResponse.refresh_token);
        sessionStorage.setItem("refresh_token", tokenResponse.refresh_token);
      }
      console.log("Access token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      return false;
    }
  };

  const login = () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // code_verifier を sessionStorage に保存
    sessionStorage.setItem("code_verifier", codeVerifier);

    // 認証 URL にリダイレクト
    const authUrl = generateAuthUrl(codeChallenge);
    window.location.href = authUrl;
  };

  const logout = () => {
    setUser(null);
    setProjects([]);
    setSelectedProject(null);
    setAccessToken(null);
    setRefreshToken(null);
    sessionStorage.removeItem("code_verifier");
    sessionStorage.removeItem("selectedProjectId");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("projects");
  };

  const value: AuthContextType = {
    user,
    projects,
    selectedProject,
    accessToken,
    refreshToken,
    isLoading,
    login,
    logout,
    refreshProjects,
    selectProject,
    refreshAccessToken: refreshAccessTokenWithContext,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
