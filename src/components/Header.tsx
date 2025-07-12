import { useAuth } from "@/contexts/AuthContext";
import { LoginButton } from "./LoginButton";
import "./Header.css";

export function Header() {
  const { user, projects, selectedProject, selectProject, logout } = useAuth();

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    selectProject(event.target.value);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="app-title">Pub/Sub Visualizer</h1>
        {user && projects.length > 0 && (
          <div className="project-selector">
            <select
              id="project-dropdown"
              className="project-dropdown"
              value={selectedProject?.projectId || ""}
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
        {user ? (
          <div className="user-menu">
            <img src={user.picture} alt="user" className="user-avatar" />
            <span className="user-name">{user.name}</span>
            <button className="logout-button" onClick={logout}>
              ログアウト
            </button>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  );
}
