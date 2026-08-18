export type DomainKey =
  | "depression"
  | "anxiety"
  | "anger"
  | "disruptive_behavior"
  | "self_concept"
  | "adhd_impulsivity";

export type UserRole = "parent" | "admin" | null;

export type DomainMetadata = {
  key: DomainKey;
  label: string;
  shortDescription: string;
  clinicalDescription: string;
  iconName: string;
  color: string;
};

export const DOMAIN_DEFINITIONS: Record<DomainKey, DomainMetadata> = {
  depression: {
    key: "depression",
    label: "Low Mood & Isolation",
    shortDescription: "Tracks feelings of sadness, withdrawal, or low energy.",
    clinicalDescription: "Screens for persistent low affect, social withdrawal, loss of interest in joyful activities, and apathy.",
    iconName: "CloudRain",
    color: "#6366f1",
  },
  anxiety: {
    key: "anxiety",
    label: "Worry & Fear",
    shortDescription: "Tracks nervousness, apprehension, or fear of trying new things.",
    clinicalDescription: "Screens for hyper-arousal, catastrophic thinking, fear of uncertainty, and avoidance behaviors.",
    iconName: "ShieldAlert",
    color: "#8b5cf6",
  },
  anger: {
    key: "anger",
    label: "Frustration & Irritability",
    shortDescription: "Tracks emotional intensity when obstacles arise.",
    clinicalDescription: "Screens for low frustration tolerance, explosive verbal/physical reactions, and difficulty de-escalating.",
    iconName: "Flame",
    color: "#ef4444",
  },
  disruptive_behavior: {
    key: "disruptive_behavior",
    label: "Rule Testing & Defiance",
    shortDescription: "Tracks reluctance to follow rules or cooperate with guidance.",
    clinicalDescription: "Screens for oppositionality, boundary pushing, intentional rule breaking, and conflict with authority figures.",
    iconName: "Zap",
    color: "#f59e0b",
  },
  self_concept: {
    key: "self_concept",
    label: "Self-Worth & Confidence",
    shortDescription: "Tracks how the child views their abilities and worth.",
    clinicalDescription: "Screens for negative self-talk, feelings of incompetence, social insecurity, and fragile self-esteem.",
    iconName: "Heart",
    color: "#ec4899",
  },
  adhd_impulsivity: {
    key: "adhd_impulsivity",
    label: "Focus & Impulse Control",
    shortDescription: "Tracks patience, staying on task, and thinking before acting.",
    clinicalDescription: "Screens for motor restlessness, hasty decision-making, difficulty delaying gratification, and distractibility.",
    iconName: "Sparkles",
    color: "#10b981",
  },
};

export type ChoicePosition = "left" | "center" | "right";

export type Choice = {
  choiceId: string;
  label: string;
  nextSceneId: string | null;
  domain: DomainKey;
  scoreWeight: number;
  position?: ChoicePosition;
  detailText?: string;
};

export type SceneVideoUrl = {
  lg: string;
  sm: string;
};

export type Scene = {
  sceneId: string;
  videoUrl: SceneVideoUrl | string;
  choices?: Choice[];
  autoNext?: string | null;
  title?: string;
  description?: string;
  domain?: DomainKey;
};

export type ChoiceLog = {
  sceneId: string;
  choiceId: string;
  choiceLabel: string;
  domain: DomainKey;
  scoreWeight: number;
  timestamp: string;
  promptedAt?: string;
  decidedAt?: string;
  decisionTimeMs?: number;
  decisionTimeSec?: string;
};

export type DomainBand = "typical" | "worth_watching" | "talk_to_professional";

export type DomainScoreResult = {
  rawScore: number;
  maxScore: number;
  normalizedPercentage: number;
  band: DomainBand;
  bandLabel: string;
  recommendation: string;
};

export type SessionRecord = {
  sessionId: string;
  childId: string;
  completedAt: string | null;
  domainScores: Record<DomainKey, DomainScoreResult> | null;
  path: ChoiceLog[];
  totalChoicesMade: number;
};

export function getBandForScore(percentage: number): DomainBand {
  if (percentage <= 33) return "typical";
  if (percentage <= 66) return "worth_watching";
  return "talk_to_professional";
}

export function getBandDetails(band: DomainBand): { label: string; badgeColor: string; textColor: string; bgColor: string; description: string } {
  switch (band) {
    case "typical":
      return {
        label: "Typical",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
        textColor: "text-emerald-700",
        bgColor: "bg-emerald-50",
        description: "Responses fall within typical developmental expectations for ages 7–12.",
      };
    case "worth_watching":
      return {
        label: "Worth Watching",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        textColor: "text-amber-700",
        bgColor: "bg-amber-50",
        description: "Mild indicators observed. Worth observing over time or discussing casually.",
      };
    case "talk_to_professional":
      return {
        label: "Talk to a Professional",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
        textColor: "text-rose-700",
        bgColor: "bg-rose-50",
        description: "Elevated indicators noted. Consider consulting a counselor, pediatrician, or child psychologist.",
      };
  }
}
