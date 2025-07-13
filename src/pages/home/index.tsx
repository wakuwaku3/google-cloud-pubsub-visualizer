import { useAuth } from "@/contexts/useAuth";
import { Header } from "./Header";
import "./index.css";

export function HomePage() {
  const { user, projects, selectedProject, isLoading, isInitialized, login } =
    useAuth();

  if (isLoading || !isInitialized) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    // 初期化が完了し、認証されていない場合は直接Google認証を実行
    login();
    return <div className="loading-container">認証中...</div>;
  }

  // 型安全性のため、projectsの存在を確認
  const hasProjects = Array.isArray(projects);

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
              {!hasProjects || projects.length === 0 ? (
                <p className="no-projects">プロジェクトがありません</p>
              ) : (
                projects.map((project) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
