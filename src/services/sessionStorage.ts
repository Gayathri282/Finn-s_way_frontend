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
    const endpoint = this.getEndpoint("/sessions");
    try {
      const response = await fetch(endpoint, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        console.log(`[Frontend SessionStorage] Session successfully created on backend API: "${data.sessionId}" (Child ID: ${data.childId})`);
        return { sessionId: data.sessionId, childId: data.childId };
      } else {
        const errText = await response.text();
        throw new Error(`Backend API returned error ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.error(`[Frontend SessionStorage Error] Failed to create session on backend API (${endpoint}):`, err);
      throw err;
    }
  }

  async logChoice(sessionId: string, choiceLog: ChoiceLog): Promise<void> {
    const endpoint = this.getEndpoint(`/sessions/${sessionId}/choice`);
    console.log(`[Frontend SessionStorage] Logging choice for Session ID "${sessionId}" -> Scene "${choiceLog.sceneId}", Choice "${choiceLog.choiceId}"`);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(choiceLog),
      });
      if (!response.ok) {
        console.warn(`[Frontend SessionStorage Warning] Choice log returned status ${response.status}`);
      }
    } catch (err) {
      console.error(`[Frontend SessionStorage Error] Failed to log choice for session "${sessionId}":`, err);
    }
  }

  async getSessionResults(sessionId: string): Promise<SessionRecord | null> {
    const endpoint = this.getEndpoint(`/sessions/${sessionId}/results`);
    console.log(`[Frontend SessionStorage] Fetching results for Session ID "${sessionId}" from API`);
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const record = await response.json();
        console.log(`[Frontend SessionStorage] Retrieved results for Session ID "${sessionId}":`, record);
        return record;
      } else {
        console.warn(`[Frontend SessionStorage Warning] getSessionResults returned status ${response.status}`);
      }
    } catch (err) {
      console.error(`[Frontend SessionStorage Error] Failed to fetch results for session "${sessionId}":`, err);
    }
    return null;
  }

  async getSessions(): Promise<SessionRecord[]> {
    const endpoint = this.getEndpoint("/sessions");
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error("[Frontend SessionStorage Error] Failed to fetch session history:", err);
    }
    return [];
  }

  async clearSessions(): Promise<void> {
    const endpoint = this.getEndpoint("/sessions");
    try {
      await fetch(endpoint, { method: "DELETE" });
    } catch (err) {
      console.error("[Frontend SessionStorage Error] Failed to clear sessions:", err);
    }
  }
}

export const sessionStorageService: ISessionStorageService = new ApiSessionStorageService();
