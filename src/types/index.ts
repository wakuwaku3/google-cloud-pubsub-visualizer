export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Project {
  projectId: string;
  name: string;
  projectNumber: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface ApiError {
  error: string;
  error_description?: string;
}
