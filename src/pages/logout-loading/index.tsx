import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { Loading } from "@/components/loading";
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

    return () => {
      clearTimeout(timer);
    };
  }, [logout, navigate]);

  return (
    <div className="logout-loading-page">
      <Loading
        message="セッションを終了しています。しばらくお待ちください。"
        variant="fullscreen"
        size="large"
      />
    </div>
  );
}
