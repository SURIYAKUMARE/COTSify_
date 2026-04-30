import { AnalyzeResponse } from "./api";

export interface SavedProject {
  id: string;
  project_title: string;
  analysis: AnalyzeResponse;
  bookmarked_components: string[];
  created_at: string;
}

const KEY = "cotsify_projects";

export function getProjects(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProjectLocal(
  project_title: string,
  analysis: AnalyzeResponse,
  bookmarked_components: string[] = []
): SavedProject {
  const projects = getProjects();
  // Overwrite if same title exists
  const existing = projects.findIndex(
    (p) => p.project_title.toLowerCase() === project_title.toLowerCase()
  );
  const entry: SavedProject = {
    id: existing >= 0 ? projects[existing].id : crypto.randomUUID(),
    project_title,
    analysis,
    bookmarked_components,
    created_at: existing >= 0 ? projects[existing].created_at : new Date().toISOString(),
  };
  if (existing >= 0) projects[existing] = entry;
  else projects.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(projects));
  return entry;
}

export function deleteProjectLocal(id: string) {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function updateBookmarksLocal(id: string, bookmarked_components: string[]) {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx >= 0) {
    projects[idx].bookmarked_components = bookmarked_components;
    localStorage.setItem(KEY, JSON.stringify(projects));
  }
}
