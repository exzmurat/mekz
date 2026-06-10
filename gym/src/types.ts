export interface WorkoutPhase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageName: string;
  timeLabel: string;
  narrative: string;
  focusMetric: string;
  focusValue: string;
}

export interface LiftConfig {
  exercise: string;
  bodyWeight: string;
  targetWeight: string;
  mentalBlock: string;
  focusLevel: 'hyper' | 'calm' | 'aggressive';
}

export interface MotivationResponse {
  monologue: string;
  quotes: string[];
  focusPoints: string[];
  rhythmBpm: number;
}

export interface WarmupSet {
  setNumber: number;
  weight: number;
  reps: number;
  intensityPct: number;
  coachingCue: string;
  chalkRequired: boolean;
}

export interface RoutineResponse {
  warmups: WarmupSet[];
  safetyNotes: string[];
  mindsetKey: string;
  estimatedDurationMin: number;
}
