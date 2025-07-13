export interface Project {
  projectId: string;
  name: string;
  projectNumber: string;
}

export interface ProjectsResponse {
  projects: Project[];
}
