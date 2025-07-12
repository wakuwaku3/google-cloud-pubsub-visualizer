import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateAuthUrl,
  getAccessToken,
  getUserInfo,
  getProjects,
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
  accessToken: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshProjects: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時に認証状態をチェック
  useEffect(() => {
    const initAuth = async () => {
      try {
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
              const token = await getAccessToken(code, codeVerifier);
              console.log(
                "Successfully obtained access token:",
                token.substring(0, 20) + "..."
              );
              setAccessToken(token);

              // ユーザー情報を取得
              const userInfo = await getUserInfo(token);
              setUser(userInfo);

              // プロジェクト一覧を取得（失敗してもログインは成功とする）
              try {
                await refreshProjects(token);
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
    } catch (error) {
      console.error("Failed to fetch projects:", error);
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
    setAccessToken(null);
    sessionStorage.removeItem("code_verifier");
  };

  const value: AuthContextType = {
    user,
    projects,
    accessToken,
    isLoading,
    login,
    logout,
    refreshProjects,
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
