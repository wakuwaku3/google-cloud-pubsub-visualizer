import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken, getUserInfo, getProjects } from "@/lib/oauth";
import "./index.css";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);

  const processAuthCode = useCallback(
    async (code: string, codeVerifier: string) => {
      try {
        console.log(
          "Processing authorization code:",
          code.substring(0, 20) + "..."
        );

        // 認可コードがある場合、アクセストークンを取得
        if (codeVerifier) {
          console.log(
            "Found code_verifier:",
            codeVerifier.substring(0, 20) + "..."
          );

          const tokenResponse = await getAccessToken(code, codeVerifier);
          console.log(
            "Successfully obtained access token:",
            tokenResponse.access_token.substring(0, 20) + "..."
          );

          // アクセストークンを保存
          sessionStorage.setItem("access_token", tokenResponse.access_token);

          // リフレッシュトークンがあれば保存
          if (tokenResponse.refresh_token) {
            sessionStorage.setItem(
              "refresh_token",
              tokenResponse.refresh_token
            );
          }

          // ユーザー情報を取得
          const userInfo = await getUserInfo(tokenResponse.access_token);
          sessionStorage.setItem("user", JSON.stringify(userInfo));

          // プロジェクト一覧を取得
          try {
            const projectsData = await getProjects(tokenResponse.access_token);
            sessionStorage.setItem("projects", JSON.stringify(projectsData));

            // プロジェクトが取得できた場合、初期選択を設定
            if (projectsData.length > 0) {
              const projectToSelect = projectsData[0];
              sessionStorage.setItem(
                "selectedProjectId",
                projectToSelect.projectId
              );
            }
          } catch (error) {
            console.warn(
              "Failed to fetch projects, but login was successful:",
              error
            );
          }

          // ホームページにリダイレクト
          void navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Token exchange failed:", error);
        // エラーが発生した場合は、エラーページにリダイレクト
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user");
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        void navigate(
          `/auth/error?error=token_exchange_failed&error_description=${encodeURIComponent(
            errorMessage
          )}`,
          { replace: true }
        );
      }
    },
    [navigate]
  );

  useEffect(() => {
    // 既に処理済みの場合は何もしない
    if (hasProcessed.current) {
      return;
    }

    // デバッグ用: sessionStorageの内容を確認
    console.log("AuthCallbackPage mounted, checking sessionStorage:");
    console.log("code_verifier:", sessionStorage.getItem("code_verifier"));
    console.log("access_token:", sessionStorage.getItem("access_token"));
    console.log("user:", sessionStorage.getItem("user"));

    // 認証エラーが発生した場合の処理
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      console.error("Authentication error:", error);
      hasProcessed.current = true;
      // エラーページにリダイレクト（エラー情報を含める）
      const errorDescription = urlParams.get("error_description");
      const errorParams = new URLSearchParams({
        error,
        ...(errorDescription && { error_description: errorDescription }),
      });
      void navigate(`/auth/error?${errorParams.toString()}`, { replace: true });
      return;
    }

    // 認可コードの処理
    const code = urlParams.get("code");
    if (code && !isProcessing) {
      // code_verifier を事前に取得して削除
      const codeVerifier = sessionStorage.getItem("code_verifier");
      if (codeVerifier) {
        hasProcessed.current = true;
        setIsProcessing(true);
        // 即座に code_verifier を削除して重複使用を防ぐ
        sessionStorage.removeItem("code_verifier");
        void processAuthCode(code, codeVerifier);
      } else {
        console.error("No code_verifier found in sessionStorage");
      }
    }
  }, [navigate, isProcessing, processAuthCode]);

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        <h2>認証中...</h2>
        <p>Google認証を処理しています。しばらくお待ちください。</p>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}
