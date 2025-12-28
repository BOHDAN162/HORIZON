const NODES_KEY = 'horizon_world_nodes';
const EDGES_KEY = 'horizon_world_edges';
const VIEW_KEY = 'horizon_world_view';
const THEME_KEY = 'horizon_theme';
const LAST_SELECTED_KEY = 'horizon_last_selected_node';

export type StoredView = { panX: number; panY: number; zoom: number };

export const storage = {
  saveNodes(nodes: unknown) {
    try {
      localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
    } catch {
      /* ignore */
    }
  },
  loadNodes<T>() {
    try {
      const raw = localStorage.getItem(NODES_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  saveEdges(edges: unknown) {
    try {
      localStorage.setItem(EDGES_KEY, JSON.stringify(edges));
    } catch {
      /* ignore */
    }
  },
  loadEdges<T>() {
    try {
      const raw = localStorage.getItem(EDGES_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  saveView(view: StoredView) {
    try {
      localStorage.setItem(VIEW_KEY, JSON.stringify(view));
    } catch {
      /* ignore */
    }
  },
  loadView(): StoredView | null {
    try {
      const raw = localStorage.getItem(VIEW_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredView;
      if (typeof parsed.panX !== 'number' || typeof parsed.panY !== 'number' || typeof parsed.zoom !== 'number') return null;
      return parsed;
    } catch {
      return null;
    }
  },
  saveTheme(theme: 'light' | 'dark') {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  },
  loadTheme(): 'light' | 'dark' | null {
    const val = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
    return val === 'light' || val === 'dark' ? val : null;
  },
  saveLastSelected(id: string | null) {
    try {
      if (!id) {
        localStorage.removeItem(LAST_SELECTED_KEY);
      } else {
        localStorage.setItem(LAST_SELECTED_KEY, id);
      }
    } catch {
      /* ignore */
    }
  },
  loadLastSelected(): string | null {
    try {
      return localStorage.getItem(LAST_SELECTED_KEY);
    } catch {
      return null;
    }
  },
};
