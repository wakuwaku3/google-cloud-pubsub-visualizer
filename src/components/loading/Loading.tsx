import "./Loading.css";

export interface LoadingProps {
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "default" | "fullscreen";
}

export function Loading({
  message = "読み込み中...",
  size = "medium",
  variant = "default",
}: LoadingProps) {
  return (
    <div className={`loading-container loading-${variant}`}>
      <div className={`loading-spinner loading-spinner-${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}
