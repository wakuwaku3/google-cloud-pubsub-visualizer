import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "@/components/button/GoogleAuthButton";
import "./index.css";

export function LogoutPage() {
  const navigate = useNavigate();

  // ログアウト処理は既にLogoutLoadingPageで実行済みのため、
  // ここでは何もしない

  const handleRelogin = () => {
    // ホームページに移動（認証が必要な場合は自動的に認証フローが開始される）
    void navigate("/", { replace: true });
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
