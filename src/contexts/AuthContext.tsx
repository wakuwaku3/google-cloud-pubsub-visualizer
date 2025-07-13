import { useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateAuthUrl,
  refreshAccessToken,
  getProjects,
} from "@/lib/oauth";
import { AuthContext } from "./AuthContextContext";
import type { AuthContextType } from "./AuthContextContext";
import type { User, Project } from "@/types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshProjects = useCallback(
    async (token?: string) => {
      try {
        const currentToken = token ?? accessToken;
        if (!currentToken) {
          throw new Error("No access token available");
        }
        const projectsData = await getProjects(currentToken);
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
    },
    [accessToken, selectedProject]
  );

  const selectProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.projectId === projectId);
      if (project) {
        setSelectedProject(project);
        sessionStorage.setItem("selectedProjectId", projectId);
      }
    },
    [projects]
  );

  // リフレッシュトークンでアクセストークンを再取得
  const refreshAccessTokenWithContext =
    useCallback(async (): Promise<boolean> => {
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
    }, [refreshToken]);

  const login = useCallback(() => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    console.log("Login function called:");
    console.log(
      "Generated code_verifier:",
      codeVerifier.substring(0, 20) + "..."
    );
    console.log(
      "Generated code_challenge:",
      codeChallenge.substring(0, 20) + "..."
    );

    // code_verifier を sessionStorage に保存
    sessionStorage.setItem("code_verifier", codeVerifier);
    console.log("code_verifier saved to sessionStorage");

    // 認証 URL にリダイレクト
    const authUrl = generateAuthUrl(codeChallenge);
    console.log("Redirecting to auth URL:", authUrl);
    window.location.href = authUrl;
  }, []);

  const logout = useCallback(() => {
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
    // ログアウト時に初期化フラグをリセット
    setIsInitialized(false);
  }, []);

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
            const userInfo = JSON.parse(savedUser) as User;
            setUser(userInfo);
            setAccessToken(savedToken);

            if (savedRefreshToken) {
              setRefreshToken(savedRefreshToken);
            }

            // プロジェクト一覧も復元
            if (savedProjects) {
              const projectsData = JSON.parse(savedProjects) as Project[];
              setProjects(projectsData);

              // 選択されたプロジェクトも復元
              const savedProjectId =
                sessionStorage.getItem("selectedProjectId");
              if (savedProjectId && projectsData.length > 0) {
                const projectToSelect = projectsData.find(
                  (p) => p.projectId === savedProjectId
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
          // 認証情報が見つからない場合は明示的にログアウト状態を設定
          console.log(
            "No saved authentication data found, setting logged out state"
          );
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          setProjects([]);
          setSelectedProject(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    void initAuth();
  }, [refreshProjects, refreshAccessTokenWithContext, logout]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      projects,
      selectedProject,
      accessToken,
      refreshToken,
      isLoading,
      isInitialized,
      setUser,
      setAccessToken,
      setRefreshToken,
      setProjects,
      setSelectedProject,
      login,
      logout,
      refreshProjects,
      selectProject,
      refreshAccessToken: refreshAccessTokenWithContext,
    }),
    [
      user,
      projects,
      selectedProject,
      accessToken,
      refreshToken,
      isLoading,
      isInitialized,
      setUser,
      setAccessToken,
      setRefreshToken,
      setProjects,
      setSelectedProject,
      login,
      logout,
      refreshProjects,
      selectProject,
      refreshAccessTokenWithContext,
    ]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
