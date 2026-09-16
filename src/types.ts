export enum GameState {
  MENU = 'MENU',
  DIFFICULTY = 'DIFFICULTY',
  STAGE_SELECT = 'STAGE_SELECT',
  RACING = 'RACING',
  PAUSED = 'PAUSED',
  RESULT = 'RESULT'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface PlayerStats {
  topSpeed: number;
  finishTime: number;
  position: number;
  completed: boolean;
}

export interface HUDState {
  speed: number;
  position: number;
  totalRacers: number;
  lapPercentage: number;
  time: number;
  countdown: number; // 3, 2, 1, 0 (GO), -1 (hidden)
}
