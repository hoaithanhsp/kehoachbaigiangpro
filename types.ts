export type ClassSize = 'small' | 'medium' | 'large';
export type TimeConstraint = '45' | '90' | '135' | '180' | '225' | '270';
export type SchoolLevel = 'primary' | 'secondary' | 'high' | 'university';

export interface LessonConfig {
  schoolLevel: SchoolLevel;
  grade: string;
  subject: string;
  classSize: ClassSize;
  resources: {
    projector: boolean;
    internet: boolean;
    materials: boolean;
  };
  customResource: string;
  timeConstraint: TimeConstraint;
  teachingFocus: string[];
  customCompetency: string;
  techApps: string;
  integration: string;
  simulationTopic?: string;
}

export interface LessonInput {
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
  config: LessonConfig;
}

export interface TeachingMethod {
  name: string;
  description: string;
  steps: string[];
}

export interface Game {
  name: string;
  duration: string;
  type: string;
  objective: string;
  steps: string[];
}

export interface Simulation {
  title: string;
  description: string;
  code: string;
}

export interface AnalysisSummary {
  subject: string;
  topic: string;
  weakness: string;
  proposal: string;
}

export interface LessonPlanResponse {
  summary: AnalysisSummary;
  methods: TeachingMethod[];
  games: Game[];
  simulation?: Simulation;
  fullPlanHtml: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}