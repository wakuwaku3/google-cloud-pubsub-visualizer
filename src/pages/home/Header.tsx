import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/button/Button";
import "./Header.css";

export function Header() {
  const navigate = useNavigate();
  const { user, projects, selectedProject, selectProject, logout } = useAuth();

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    selectProject(event.target.value);
  };

  const handleLogout = () => {
    logout();
    void navigate("/logout");
  };

  // 型安全性のため、userとprojectsの存在を確認
  const hasUser = user !== null;
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="app-title">Pub/Sub Visualizer</h1>
        {hasUser && hasProjects && (
          <div className="project-selector">
            <select
              id="project-dropdown"
              className="project-dropdown"
              value={selectedProject?.projectId ?? ""}
              onChange={handleProjectChange}
            >
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="header-right">
        {hasUser && (
          <div className="user-menu">
            <img src={user.picture} alt="user" className="user-avatar" />
            <span className="user-name">{user.name}</span>
            <Button variant="text" size="small" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
