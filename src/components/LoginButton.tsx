import { useAuth } from "@/contexts/AuthContext";
import { GoogleIcon } from "./GoogleIcon";
import "./LoginButton.css";

export function LoginButton() {
  const { login, isLoading } = useAuth();

  return (
    <button onClick={login} disabled={isLoading} className="login-button">
      <GoogleIcon />
      <span className="login-text">
        {isLoading ? "ログイン中..." : "Google でログイン"}
      </span>
    </button>
  );
}
