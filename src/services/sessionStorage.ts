import type {
  ChoiceLog,
  DomainKey,
  DomainScoreResult,
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

function getBandForPercentage(percentage: number) {
  if (percentage <= 33) return "typical" as const;
  if (percentage <= 66) return "worth_watching" as const;
  return "talk_to_professional" as const;
}

function computeDomainResult(_domain: DomainKey, rawScore: number, maxScore: number = 6): DomainScoreResult {
  const rawPercentage = Math.round((rawScore / maxScore) * 100);
  const normalizedPercentage = Math.min(100, Math.max(0, rawPercentage));
  const band = getBandForPercentage(normalizedPercentage);

  let bandLabel = "Typical";
  let recommendation = "Behaviors fall within typical developmental expectations.";

  if (band === "worth_watching") {
    bandLabel = "Worth Watching";
    recommendation = "Mild indicators noted. Observe behaviors during routine activities.";
  } else if (band === "talk_to_professional") {
    bandLabel = "Talk to a Professional";
    recommendation = "Elevated indicators observed. Consider consulting a pediatric health professional.";
  }

  return {
    rawScore,
    maxScore,
    normalizedPercentage,
    band,
    bandLabel,
    recommendation,
  };
}

class ApiSessionStorageService implements ISessionStorageService {
  private localSessions = new Map<string, SessionRecord>();

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
    } catch {
      // Backend unready -> use local in-memory fallback
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const childId = `Finn-Explorer-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: SessionRecord = {
      sessionId,
      childId,
      completedAt: null,
      domainScores: null,
      path: [],
      totalChoicesMade: 0,
    };
    this.localSessions.set(sessionId, record);
    return { sessionId, childId };
  }

  async logChoice(sessionId: string, choiceLog: ChoiceLog): Promise<void> {
    try {
      const response = await fetch(this.getEndpoint(`/sessions/${sessionId}/choice`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(choiceLog),
      });
      if (response.ok) return;
    } catch {
      // Fallback to local session store
    }

    let record = this.localSessions.get(sessionId);
    if (!record) {
      record = {
        sessionId,
        childId: `Finn-Explorer-${Math.floor(1000 + Math.random() * 9000)}`,
        completedAt: null,
        domainScores: null,
        path: [],
        totalChoicesMade: 0,
      };
      this.localSessions.set(sessionId, record);
    }

    const exists = record.path.some((c) => c.sceneId === choiceLog.sceneId && c.choiceId === choiceLog.choiceId);
    if (!exists) {
      record.path.push(choiceLog);
      record.totalChoicesMade = record.path.length;
    }
  }

  async getSessionResults(sessionId: string): Promise<SessionRecord | null> {
    try {
      const response = await fetch(this.getEndpoint(`/sessions/${sessionId}/results`));
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    const record = this.localSessions.get(sessionId);
    if (!record) return null;

    const rawTotals: Record<DomainKey, number> = {
      depression: 0,
      anxiety: 0,
      anger: 0,
      disruptive_behavior: 0,
      self_concept: 0,
      adhd_impulsivity: 0,
    };

    record.path.forEach((choice) => {
      if (rawTotals[choice.domain] !== undefined) {
        rawTotals[choice.domain] += choice.scoreWeight;
      }
    });

    record.domainScores = {
      depression: computeDomainResult("depression", rawTotals.depression, 6),
      anxiety: computeDomainResult("anxiety", rawTotals.anxiety, 6),
      anger: computeDomainResult("anger", rawTotals.anger, 6),
      disruptive_behavior: computeDomainResult("disruptive_behavior", rawTotals.disruptive_behavior, 6),
      self_concept: computeDomainResult("self_concept", rawTotals.self_concept, 6),
      adhd_impulsivity: computeDomainResult("adhd_impulsivity", rawTotals.adhd_impulsivity, 6),
    };

    if (!record.completedAt) {
      record.completedAt = new Date().toISOString();
    }

    return record;
  }

  async getSessions(): Promise<SessionRecord[]> {
    try {
      const response = await fetch(this.getEndpoint("/sessions"));
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    return Array.from(this.localSessions.values());
  }

  async clearSessions(): Promise<void> {
    try {
      await fetch(this.getEndpoint("/sessions"), { method: "DELETE" });
    } catch {
      // Fallback
    }
    this.localSessions.clear();
  }
}

export const sessionStorageService: ISessionStorageService = new ApiSessionStorageService();
