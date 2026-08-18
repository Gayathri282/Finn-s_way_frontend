import type {
  ChoiceLog,
  SessionRecord,
} from "../types/screening";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ISessionStorageService {
  createSession(): Promise<{ sessionId: string; childId: string }>;
  logChoice(sessionId: string, choiceLog: ChoiceLog): Promise<void>;
  getSessionResults(sessionId: string): Promise<SessionRecord | null>;
  getSessions(): Promise<SessionRecord[]>;
  clearSessions(): Promise<void>;
}

class ApiSessionStorageService implements ISessionStorageService {
  private getEndpoint(path: string): string {
    const base = API_BASE_URL.replace(/\/$/, "");
    const cleanPath = path.replace(/^\//, "");
    return `${base}/${cleanPath}`;
  }

  async createSession(): Promise<{ sessionId: string; childId: string }> {
    try {
      const response = await fetch(this.getEndpoint("/sessions"), { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        return { sessionId: data.sessionId, childId: data.childId };
      }
    } catch (err) {
      console.warn("Failed to create session on API, using fallback ID", err);
    }
    const fallbackId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return { sessionId: fallbackId, childId: `Finn-Explorer-${Math.floor(1000 + Math.random() * 9000)}` };
  }

  async logChoice(sessionId: string, choiceLog: ChoiceLog): Promise<void> {
    try {
      await fetch(this.getEndpoint(`/sessions/${sessionId}/choice`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(choiceLog),
      });
    } catch (err) {
      console.warn(`Failed to log choice for session ${sessionId} to API`, err);
    }
  }

  async getSessionResults(sessionId: string): Promise<SessionRecord | null> {
    try {
      const response = await fetch(this.getEndpoint(`/sessions/${sessionId}/results`));
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn(`Failed to fetch session results for ${sessionId}`, err);
    }
    return null;
  }

  async getSessions(): Promise<SessionRecord[]> {
    try {
      const response = await fetch(this.getEndpoint("/sessions"));
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn("Failed to fetch sessions history from API", err);
    }
    return [];
  }

  async clearSessions(): Promise<void> {
    try {
      await fetch(this.getEndpoint("/sessions"), { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to clear sessions on API", err);
    }
  }
}

export const sessionStorageService: ISessionStorageService = new ApiSessionStorageService();
