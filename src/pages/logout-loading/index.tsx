import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import "./index.css";

export function LogoutLoadingPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  React.useEffect(() => {
    // ログアウト処理を実行
    logout();

    // 少し遅延を入れてからログアウト完了ページに移動
    const timer = setTimeout(() => {
      void navigate("/logout", { replace: true });
    }, 1000);

    return () => { clearTimeout(timer); };
  }, [logout, navigate]);

  return (
    <div className="logout-loading-page">
      <div className="logout-loading-content">
        <div className="loading-spinner"></div>
        <h1 className="logout-loading-title">ログアウト中...</h1>
        <p className="logout-loading-message">
          セッションを終了しています。しばらくお待ちください。
        </p>
      </div>
    </div>
  );
}
