
export enum GameState {
  MENU = 'MENU',
  RACING = 'RACING',
  CRASHED = 'CRASHED'
}

export interface PlayerStats {
  speed: number;
  distance: number;
  highScore: number;
  commentary: string;
}

export interface ObstacleData {
  id: number;
  z: number;
  x: number;
  type: 'barrier' | 'slow';
}
