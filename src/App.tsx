import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginButton } from "@/components/LoginButton";
import "./App.css";

function Main() {
  const { user, projects, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="login-container">
        <h1 className="app-title">Google Cloud Pub/Sub Visualizer</h1>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="user-card">
        <img src={user.picture} alt="user" className="user-avatar" />
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
        <button className="logout-button" onClick={logout}>
          ログアウト
        </button>
      </div>
      <div className="projects-card">
        <div className="projects-title">アクセス可能なプロジェクト一覧</div>
        <ul className="projects-list">
          {projects.length === 0 && <li>プロジェクトがありません</li>}
          {projects.map((p) => (
            <li key={p.projectId}>
              <span className="project-id">{p.projectId}</span> - {p.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

export default App;
