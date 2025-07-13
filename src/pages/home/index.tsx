import { useAuth } from "@/contexts/useAuth";
import "./index.css";

export function HomePage() {
  const { user, projects, selectedProject } = useAuth();

  // ProtectedRouteで認証チェックが完了しているため、userはnullでないことが保証される
  const hasProjects = Array.isArray(projects);

  return (
    <div className="content-container">
      <div className="welcome-section">
        <h2>ようこそ、{user?.name ?? "ゲスト"}さん</h2>
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
  );
}
