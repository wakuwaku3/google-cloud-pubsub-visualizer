import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleAuthButton } from "@/components/button/GoogleAuthButton";
import "./index.css";

export function AuthErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const handleRetry = () => {
    // セッションストレージをクリアしてからホームページに移動
    sessionStorage.removeItem("code_verifier");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("projects");
    sessionStorage.removeItem("selectedProjectId");
    void navigate("/", { replace: true });
  };

  return (
    <div className="auth-error-container">
      <div className="auth-error-content">
        <h1 className="auth-error-title">認証エラー</h1>
        <div className="auth-error-message">
          <p>Google認証の処理中にエラーが発生しました。</p>
          {error && (
            <div className="error-details">
              <p>
                <strong>エラーコード:</strong> {error}
              </p>
              {errorDescription && (
                <p>
                  <strong>エラー詳細:</strong> {errorDescription}
                </p>
              )}
            </div>
          )}
          <p>再度ログインを行ってください。</p>
        </div>
        <div className="auth-error-actions">
          <GoogleAuthButton onClick={handleRetry}>再ログイン</GoogleAuthButton>
        </div>
      </div>
    </div>
  );
}
