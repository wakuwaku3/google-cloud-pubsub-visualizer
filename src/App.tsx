import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { LoginButton } from "@/components/LoginButton";
import "./App.css";

function Main() {
  const { user, projects, selectedProject, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="login-container">
        <h1 className="app-title">Google Cloud Pub/Sub Visualizer</h1>
        <div className="login-content">
          <p className="login-description">
            Google Cloud の Pub/Sub
            コンポーネントを視覚的に表示するアプリケーションです。
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="content-container">
          <div className="welcome-section">
            <h2>ようこそ、{user.name}さん</h2>
            {selectedProject && (
              <p className="selected-project">
                選択中のプロジェクト: <strong>{selectedProject.name}</strong>
              </p>
            )}
          </div>

          <div className="projects-section">
            <h3>アクセス可能なプロジェクト一覧</h3>
            <div className="projects-grid">
              {projects.length === 0 && (
                <p className="no-projects">プロジェクトがありません</p>
              )}
              {projects.map((project) => (
                <div
                  key={project.projectId}
                  className={`project-item ${
                    selectedProject?.projectId === project.projectId
                      ? "selected"
                      : ""
                  }`}
                >
                  <div className="project-name">{project.name}</div>
                  <div className="project-id">{project.projectId}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
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
