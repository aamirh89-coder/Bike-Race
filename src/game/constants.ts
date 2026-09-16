export const COLORS = {
  SKY: '#070B19',
  TREE: '#005108',
  FOG: '#000000',
  LIGHT: {
    road: '#6b6b6b',
    grass: '#10AA10',
    rumble: '#ffffff',
    lane: '#cccccc'
  },
  DARK: {
    road: '#646464',
    grass: '#009A00',
    rumble: '#ff0000',
    lane: '#646464' // blends with road
  },
  START: {
    road: '#ffffff',
    grass: '#10AA10',
    rumble: '#ffffff',
    lane: '#ffffff'
  },
  FINISH: {
    road: '#000000',
    grass: '#10AA10',
    rumble: '#000000',
    lane: '#000000'
  }
};

export const GAME_SETTINGS = {
  fps: 60,
  step: 1 / 60,
  width: 1024,
  height: 768,
  fieldOfView: 100,
  cameraHeight: 1000,
  cameraDepth: 1, // calculated in engine
  drawDistance: 300,
  playerZ: 1000, // Distance from camera
  segmentLength: 200,
  rumbleLength: 3,
  trackWidth: 2000,
  lanes: 3,
  maxSpeed: 400, // Display speed (km/h)
  engineMaxSpeed: 24000, // Internal speed calculation
  accel: 24000 / 5, // reach max speed in 5 seconds
  breaking: -24000 / 2, // stop in 2 seconds
  decel: -24000 / 10,
  offRoadDecel: -24000 / 2,
  offRoadLimit: 24000 / 4,
  centrifugal: 0.3
};

// Bike rendering colors
export const BIKE_COLORS = [
  '#00FFFF', // Player (Cyan)
  '#FF00FF', // Magenta
  '#FFFF00', // Yellow
  '#FF4400', // Orange
  '#00FF00', // Green
  '#FFFFFF'  // White
];
