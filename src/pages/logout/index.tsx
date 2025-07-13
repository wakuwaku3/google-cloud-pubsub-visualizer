import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "@/components/button/GoogleAuthButton";
import "./index.css";

export function LogoutPage() {
  const navigate = useNavigate();

  // コンポーネントマウント時にセッションストレージをクリア
  React.useEffect(() => {
    // ログアウト処理を確実に実行
    sessionStorage.removeItem("code_verifier");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("projects");
    sessionStorage.removeItem("selectedProjectId");
  }, []);

  const handleRelogin = () => {
    // セッションストレージを完全にクリアしてからホームページに移動
    sessionStorage.removeItem("code_verifier");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("projects");
    sessionStorage.removeItem("selectedProjectId");

    // 少し遅延を入れてからホームページに移動（セッションストレージのクリアを確実にするため）
    setTimeout(() => {
      void navigate("/", { replace: true });
    }, 50);
  };

  return (
    <div className="logout-page">
      <div className="logout-content">
        <h1 className="logout-title">ログアウト完了</h1>
        <div className="logout-message">
          <p>Google Cloud Pub/Sub Visualizer からログアウトしました。</p>
          <p>再度ログインするには、下のボタンをクリックしてください。</p>
        </div>
        <GoogleAuthButton onClick={handleRelogin}>
          Google で再ログイン
        </GoogleAuthButton>
      </div>
    </div>
  );
}
