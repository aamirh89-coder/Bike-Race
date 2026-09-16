import { COLORS } from './constants';

export interface Segment {
  index: number;
  p1: { world: any; camera: any; screen: any };
  p2: { world: any; camera: any; screen: any };
  curve: number;
  color: any;
  looped?: boolean;
}

const ROAD = {
  LENGTH: { NONE: 0, SHORT: 50, MEDIUM: 100, LONG: 200 },
  HILL: { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60 },
  CURVE: { NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6 }
};

export class TrackBuilder {
  private segments: Segment[] = [];

  private addSegment(curve: number, y: number) {
    const n = this.segments.length;
    this.segments.push({
      index: n,
      p1: { world: { x: 0, y: this.lastY(), z: n * 200 }, camera: {}, screen: {} },
      p2: { world: { x: 0, y: y, z: (n + 1) * 200 }, camera: {}, screen: {} },
      curve: curve,
      // Create starting and finishing lines
      color: Math.floor(n / 3) % 2 ? COLORS.DARK : COLORS.LIGHT
    });
  }

  private lastY() {
    return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].p2.world.y;
  }

  private addRoad(enter: number, hold: number, leave: number, curve: number, y: number) {
    const startY = this.lastY();
    const endY = startY + (Math.floor(y) * 200);
    let n, total = enter + hold + leave;
    for (n = 0; n < enter; n++) this.addSegment(this.easeIn(0, curve, n / enter), this.easeInOut(startY, endY, n / total));
    for (n = 0; n < hold; n++) this.addSegment(curve, this.easeInOut(startY, endY, (enter + n) / total));
    for (n = 0; n < leave; n++) this.addSegment(this.easeInOut(curve, 0, n / leave), this.easeInOut(startY, endY, (enter + hold + n) / total));
  }

  private addStraight(num: number = ROAD.LENGTH.MEDIUM) {
    this.addRoad(num, num, num, 0, 0);
  }

  private addHill(num: number = ROAD.LENGTH.MEDIUM, height: number = ROAD.HILL.MEDIUM) {
    this.addRoad(num, num, num, 0, height);
  }

  private addCurve(num: number = ROAD.LENGTH.MEDIUM, curve: number = ROAD.CURVE.MEDIUM, height: number = ROAD.HILL.NONE) {
    this.addRoad(num, num, num, curve, height);
  }
  
  private addSCurves() {
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.NONE);
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.EASY, -ROAD.HILL.LOW);
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.MEDIUM);
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
  }

  // Math helpers
  private easeIn(a: number, b: number, percent: number) { return a + (b - a) * Math.pow(percent, 2); }
  private easeOut(a: number, b: number, percent: number) { return a + (b - a) * (1 - Math.pow(1 - percent, 2)); }
  private easeInOut(a: number, b: number, percent: number) { return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5); }

  public buildStage(stage: number): Segment[] {
    this.segments = [];
    
    // Start line area
    this.addStraight(ROAD.LENGTH.SHORT);

    // Complexity scales with stage (1 to 10)
    const sections = 5 + (stage * 2);
    
    for (let i = 0; i < sections; i++) {
      const type = Math.floor(Math.random() * 4);
      const intensity = 1 + (stage * 0.5); // curves get sharper, hills steeper
      
      switch(type) {
        case 0:
          this.addStraight(ROAD.LENGTH.MEDIUM);
          break;
        case 1:
          this.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM * intensity * (Math.random() > 0.5 ? 1 : -1), ROAD.HILL.NONE);
          break;
        case 2:
          this.addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.MEDIUM * intensity * (Math.random() > 0.5 ? 1 : -1));
          break;
        case 3:
          this.addRoad(ROAD.LENGTH.SHORT, ROAD.LENGTH.SHORT, ROAD.LENGTH.SHORT, ROAD.CURVE.HARD * intensity * (Math.random() > 0.5 ? 1 : -1), ROAD.HILL.HIGH * intensity);
          break;
      }
    }

    // Finish line area
    this.addStraight(ROAD.LENGTH.LONG);

    // Color the start and finish lines
    for (let i = 0; i < ROAD.LENGTH.SHORT; i++) {
        this.segments[i].color = COLORS.START;
    }
    
    const finishIndex = this.segments.length - ROAD.LENGTH.LONG;
    for (let i = 0; i < ROAD.LENGTH.SHORT; i++) {
      if (this.segments[finishIndex + i]) {
         this.segments[finishIndex + i].color = COLORS.FINISH;
      }
    }

    return this.segments;
  }
}
