import { COLORS, GAME_SETTINGS, BIKE_COLORS } from './constants';
import { TrackBuilder, Segment } from './TrackBuilder';
import { BikeRenderer } from './BikeRenderer';
import { AudioEngine } from './AudioEngine';
import { Difficulty, HUDState } from '../types';

interface Opponent {
  z: number;
  x: number;
  speed: number;
  color: string;
  maxSpeed: number;
  currentLean: number;
}

export class RacingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrame: number = 0;
  
  private onHUDUpdate: (hud: HUDState) => void;
  private onRaceEnd: (position: number, time: number, topSpeed: number) => void;

  private segments: Segment[] = [];
  private trackLength: number = 0;
  private opponents: Opponent[] = [];
  
  // Game state
  private isPlaying: boolean = false;
  private countdown: number = 3; // 3, 2, 1, 0(GO), -1(Done)
  private startTime: number = 0;
  private raceTime: number = 0;
  
  // Player stats
  private position: number = 0;
  private playerX: number = 0;
  private playerZ: number = 0;
  private speed: number = 0;
  private maxRecordedSpeed: number = 0;
  private currentLapTime: number = 0;
  private playerLean: number = 0;

  // Controls
  private keys: { [key: string]: boolean } = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };
  public touchInputs: { left: boolean, right: boolean, up: boolean, down: boolean } = { left: false, right: false, up: false, down: false };

  private audioEngine: AudioEngine;

  constructor(
    canvas: HTMLCanvasElement, 
    stage: number, 
    difficulty: Difficulty,
    onHUDUpdate: (hud: HUDState) => void,
    onRaceEnd: (position: number, time: number, topSpeed: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
    this.onHUDUpdate = onHUDUpdate;
    this.onRaceEnd = onRaceEnd;
    this.audioEngine = new AudioEngine();

    // Setup High DPI Canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    // Build Track
    const builder = new TrackBuilder();
    this.segments = builder.buildStage(stage);
    this.trackLength = this.segments.length * GAME_SETTINGS.segmentLength;

    // Build Opponents
    this.initOpponents(difficulty, stage);

    // Bind controls
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private initOpponents(difficulty: Difficulty, stage: number) {
    let baseSpeedMulti = 0.7; // easy
    if (difficulty === Difficulty.MEDIUM) baseSpeedMulti = 0.85;
    if (difficulty === Difficulty.HARD) baseSpeedMulti = 0.95;
    
    // Slightly increase difficulty by stage
    baseSpeedMulti += (stage * 0.01);

    this.opponents = [];
    for (let i = 0; i < 3; i++) {
      this.opponents.push({
        z: (i + 1) * 2000, // start ahead of player
        x: (Math.random() * 1.5) - 0.75, // random lane
        speed: 0,
        color: BIKE_COLORS[i + 1],
        maxSpeed: GAME_SETTINGS.engineMaxSpeed * (baseSpeedMulti + (Math.random() * 0.1)),
        currentLean: 0
      });
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => { this.keys[e.code] = true; }
  private handleKeyUp = (e: KeyboardEvent) => { this.keys[e.code] = false; }

  public start() {
    this.audioEngine.init();
    this.isPlaying = true;
    this.startCountdown();
  }

  private startCountdown() {
    this.countdown = 3;
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === -1) {
        clearInterval(interval);
        this.startTime = performance.now();
      }
    }, 1000);
    this.loop();
  }

  public stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animFrame);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.audioEngine.destroy();
  }

  private update(dt: number) {
    if (this.countdown > 0) return; // Freeze physics during 3,2,1

    const up = this.keys['ArrowUp'] || this.keys['KeyW'] || this.touchInputs.up;
    const down = this.keys['ArrowDown'] || this.keys['KeyS'] || this.touchInputs.down;
    const left = this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchInputs.left;
    const right = this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchInputs.right;

    const playerSegment = this.findSegment(this.playerZ + GAME_SETTINGS.playerZ);
    const speedPercent = this.speed / GAME_SETTINGS.engineMaxSpeed;
    const dx = dt * 2 * speedPercent; 

    // Acceleration
    if (up) {
      this.speed += GAME_SETTINGS.accel * dt;
    } else if (down) {
      this.speed += GAME_SETTINGS.breaking * dt;
    } else {
      this.speed += GAME_SETTINGS.decel * dt;
    }

    // Steering
    if (left) this.playerX -= dx;
    else if (right) this.playerX += dx;

    // Centrifugal force (pushes player outside curve)
    this.playerX -= (dx * speedPercent * playerSegment.curve * GAME_SETTINGS.centrifugal);

    // Bounds checking (Strictly keep bike on track)
    this.playerX = Math.max(-0.95, Math.min(0.95, this.playerX));
    this.speed = Math.max(0, Math.min(GAME_SETTINGS.engineMaxSpeed, this.speed));

    // Smooth Lean physics
    let targetLean = (left ? -0.8 : (right ? 0.8 : 0)) + (playerSegment.curve * speedPercent * 1.5);
    // Clamp the lean to prevent overturning (between -0.9 and 0.9 radians, roughly 50 degrees)
    targetLean = Math.max(-0.9, Math.min(0.9, targetLean));
    this.playerLean += (targetLean - this.playerLean) * dt * 5.0; // Smoothly interpolate

    this.playerZ += this.speed * dt;

    // Track recorded speed for stats
    const displaySpeed = Math.round((this.speed / GAME_SETTINGS.engineMaxSpeed) * GAME_SETTINGS.maxSpeed);
    if (displaySpeed > this.maxRecordedSpeed) this.maxRecordedSpeed = displaySpeed;

    // Update Opponents (AI)
    this.updateOpponents(dt, playerSegment);

    // Audio Update
    this.audioEngine.update(speedPercent, up);

    // Race End check
    if (this.playerZ >= this.trackLength - (GAME_SETTINGS.segmentLength * 10)) {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.audioEngine.stop();
            // Calculate final position
            let finalPos = 1;
            this.opponents.forEach(o => { if (o.z > this.playerZ) finalPos++; });
            this.onRaceEnd(finalPos, this.currentLapTime, this.maxRecordedSpeed);
        }
    } else {
       if (this.countdown === -1) {
           this.currentLapTime = performance.now() - this.startTime;
       }
    }

    // Update HUD
    let currentPos = 1;
    this.opponents.forEach(o => { if (o.z > this.playerZ) currentPos++; });
    
    this.onHUDUpdate({
        speed: displaySpeed,
        position: currentPos,
        totalRacers: this.opponents.length + 1,
        lapPercentage: Math.min(100, Math.round((this.playerZ / this.trackLength) * 100)),
        time: this.currentLapTime,
        countdown: this.countdown
    });
  }

  private updateOpponents(dt: number, playerSeg: Segment) {
    this.opponents.forEach(opp => {
      // AI Acceleration
      if (opp.speed < opp.maxSpeed) {
         opp.speed += GAME_SETTINGS.accel * dt * 0.5;
      }
      
      opp.z += opp.speed * dt;
      
      const oppSeg = this.findSegment(opp.z);
      
      // Simple AI steering: stay near center but avoid others
      // If curve, drift slightly
      opp.x -= (dt * (opp.speed/GAME_SETTINGS.engineMaxSpeed) * oppSeg.curve * GAME_SETTINGS.centrifugal * 0.5);
      
      // Avoid player
      if (Math.abs(opp.z - this.playerZ) < 500 && Math.abs(opp.x - this.playerX) < 0.5) {
         if (opp.z < this.playerZ) opp.speed += GAME_SETTINGS.breaking * dt; // brake
         else opp.x += (opp.x > this.playerX ? 0.05 : -0.05); // dodge
      }

      // Bound check
      opp.x = Math.max(-0.8, Math.min(0.8, opp.x));

      // Smooth AI lean
      let targetLean = oppSeg.curve * 1.5;
      targetLean = Math.max(-0.9, Math.min(0.9, targetLean));
      opp.currentLean += (targetLean - opp.currentLean) * dt * 5.0;
    });
  }

  private findSegment(z: number): Segment {
    return this.segments[Math.floor(z / GAME_SETTINGS.segmentLength) % this.segments.length];
  }

  private project(p: any, cameraX: number, cameraY: number, cameraZ: number, cameraDepth: number, width: number, height: number, roadWidth: number) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth / p.camera.z;
    p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
    p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
    p.screen.w = Math.round((p.screen.scale * roadWidth * width / 2));
  }

  private drawPolygon(ctx: CanvasRenderingContext2D, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1);
    ctx.lineTo(x2 - w2, y2);
    ctx.lineTo(x2 + w2, y2);
    ctx.lineTo(x1 + w1, y1);
    ctx.closePath();
    ctx.fill();
  }

  private render() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear & draw sky
    this.ctx.fillStyle = COLORS.SKY;
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw pseudo-3d mountains (parallax)
    const baseSegment = this.findSegment(this.playerZ);
    const basePercent = (this.playerZ % GAME_SETTINGS.segmentLength) / GAME_SETTINGS.segmentLength;
    
    this.playerY = this.interpolate(baseSegment.p1.world.y, baseSegment.p2.world.y, basePercent);
    const cameraX = this.playerX * GAME_SETTINGS.trackWidth;
    
    // Apply camera shake at high speeds
    const speedPercent = this.speed / GAME_SETTINGS.engineMaxSpeed;
    let shakeX = 0; let shakeY = 0;
    if (speedPercent > 0.8 && this.countdown < 0) {
        shakeX = (Math.random() - 0.5) * 10 * speedPercent;
        shakeY = (Math.random() - 0.5) * 10 * speedPercent;
    }
    
    const cameraY = this.playerY + GAME_SETTINGS.cameraHeight + shakeY;
    const cameraZ = this.playerZ + shakeX; // slight depth wobble
    const cameraDepth = 1 / Math.tan((GAME_SETTINGS.fieldOfView / 2) * Math.PI / 180);

    let maxY = height;
    let dx = -(baseSegment.curve * basePercent);
    let x = 0;

    // Draw Segments (Painters algorithm, front to back for rendering coords, but draw back to front logic via maxY)
    for (let n = 0; n < GAME_SETTINGS.drawDistance; n++) {
      const segment = this.segments[(baseSegment.index + n) % this.segments.length];
      segment.looped = segment.index < baseSegment.index;
      
      segment.p1.world.z = segment.index * GAME_SETTINGS.segmentLength;
      segment.p2.world.z = (segment.index + 1) * GAME_SETTINGS.segmentLength;

      if (segment.looped) {
         segment.p1.world.z += this.trackLength;
         segment.p2.world.z += this.trackLength;
      }

      this.project(segment.p1, cameraX - x, cameraY, cameraZ, cameraDepth, width, height, GAME_SETTINGS.trackWidth);
      this.project(segment.p2, cameraX - x - dx, cameraY, cameraZ, cameraDepth, width, height, GAME_SETTINGS.trackWidth);

      x += dx;
      dx += segment.curve;

      if ((segment.p1.camera.z <= cameraDepth) || (segment.p2.screen.y >= maxY)) continue;

      this.drawSegment(width, GAME_SETTINGS.lanes, segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
                       segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w, segment.color, segment.index);

      maxY = segment.p1.screen.y;
    }

    // Draw Opponents & Banners & Player (Back to front)
    const spritesToDraw: any[] = [];
    for (const opp of this.opponents) {
       const oppSeg = this.findSegment(opp.z);
       if (opp.z > this.playerZ && opp.z < this.playerZ + (GAME_SETTINGS.drawDistance * GAME_SETTINGS.segmentLength)) {
           spritesToDraw.push({ type: 'opp', opp, seg: oppSeg, z: opp.z });
       }
    }
    
    // Check if finish line is in draw distance
    const finishSegIndex = this.segments.length - 200; // ROAD.LENGTH.LONG is 200
    const finishZ = finishSegIndex * GAME_SETTINGS.segmentLength;
    if (finishZ > this.playerZ && finishZ < this.playerZ + (GAME_SETTINGS.drawDistance * GAME_SETTINGS.segmentLength)) {
        spritesToDraw.push({ type: 'banner', seg: this.segments[finishSegIndex], z: finishZ });
    }
    
    // Add Player to spritesToDraw to correctly depth-sort
    const playerRenderSeg = this.findSegment(this.playerZ + GAME_SETTINGS.playerZ);
    spritesToDraw.push({
        type: 'player',
        seg: playerRenderSeg,
        z: this.playerZ + GAME_SETTINGS.playerZ
    });
    
    // Sort by Z descending
    spritesToDraw.sort((a, b) => b.z - a.z).forEach(item => {
        if (item.type === 'opp') {
            const spriteScale = item.seg.p1.screen.scale;
            const spriteX = item.seg.p1.screen.x + (spriteScale * item.opp.x * GAME_SETTINGS.trackWidth * width / 2);
            const spriteY = item.seg.p1.screen.y;
            // Use smoothed currentLean
            const lean = item.opp.currentLean;
            
            BikeRenderer.drawBike(
               this.ctx, width, height, window.devicePixelRatio, 
               spriteX, spriteY, spriteScale, lean, item.opp.color, false
            );
        } else if (item.type === 'banner') {
            const scale = item.seg.p1.screen.scale;
            const x = item.seg.p1.screen.x;
            const y = item.seg.p1.screen.y;
            const w = item.seg.p1.screen.w * 1.5; // span wider than track
            
            // 2000 units above road
            const hOffset = scale * 2500 * height / 2;
            const yBanner = y - hOffset;
            const pW = scale * 100 * width / 2; // pillar width
            
            this.ctx.save();
            
            // Draw pillars
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(x - w - pW, yBanner, pW, hOffset);
            this.ctx.fillRect(x + w, yBanner, pW, hOffset);
            
            // Draw checkered banner
            const bw = w * 2;
            const bh = scale * 500 * height / 2;
            const cols = 20;
            const rows = 4;
            const cw = bw / cols;
            const ch = bh / rows;
            
            for (let r = 0; r < rows; r++) {
               for (let c = 0; c < cols; c++) {
                   this.ctx.fillStyle = (r + c) % 2 === 0 ? '#FFFFFF' : '#000000';
                   this.ctx.fillRect(x - w + c * cw, yBanner, cw, ch);
               }
            }
            
            // Draw "FINISH" text
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = `900 ${scale * 400 * height / 2}px sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = scale * 20 * height / 2;
            this.ctx.strokeText("FINISH", x, yBanner + bh/2);
            this.ctx.fillText("FINISH", x, yBanner + bh/2);
            
            this.ctx.restore();
        } else if (item.type === 'player') {
            const playerScale = item.seg.p1.screen.scale;
            const playerY = item.seg.p1.screen.y;
            BikeRenderer.drawBike(
               this.ctx, width, height, window.devicePixelRatio,
               width / 2, playerY, playerScale, this.playerLean, BIKE_COLORS[0], true
            );
        }
    });

    // Apply speed blur effect at high speeds
    if (speedPercent > 0.85) {
        this.ctx.fillStyle = `rgba(0,0,0,${(speedPercent - 0.85) * 1.5})`;
        this.ctx.fillRect(0,0,width,height);
    }
  }

  private drawSegment(width: number, lanes: number, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: any, segIndex: number) {
    const r1 = w1 / Math.max(6, 2 * lanes);
    const r2 = w2 / Math.max(6, 2 * lanes);
    const l1 = w1 / Math.max(32, 8 * lanes);
    const l2 = w2 / Math.max(32, 8 * lanes);

    this.ctx.fillStyle = color.grass;
    this.ctx.fillRect(0, y2, width, y1 - y2);
    
    if (color === COLORS.FINISH) {
        // Draw Checkered Finish Line Road
        const totalCols = 10;
        const halfSw1 = w1 / totalCols; // half-width of one square
        const halfSw2 = w2 / totalCols;
        let cx1 = (x1 - w1) + halfSw1;
        let cx2 = (x2 - w2) + halfSw2;
        
        for (let i = 0; i < totalCols; i++) {
            const sqColor = (i + Math.floor(segIndex / 2)) % 2 === 0 ? '#FFFFFF' : '#000000';
            this.drawPolygon(this.ctx, cx1, y1, halfSw1, cx2, y2, halfSw2, sqColor);
            cx1 += halfSw1 * 2;
            cx2 += halfSw2 * 2;
        }
    } else {
        this.drawPolygon(this.ctx, x1, y1, w1, x2, y2, w2, color.road);
        this.drawPolygon(this.ctx, x1, y1, w1, x2, y2, w2, color.rumble); // rumble base
        this.drawPolygon(this.ctx, x1, y1, w1 - r1, x2, y2, w2 - r2, color.road);
        
        if (color.lane) {
          const lanew1 = w1 * 2 / lanes;
          const lanew2 = w2 * 2 / lanes;
          let lanex1 = x1 - w1 + lanew1;
          let lanex2 = x2 - w2 + lanew2;
          for (let lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++) {
            this.drawPolygon(this.ctx, lanex1, y1, l1, lanex2, y2, l2, color.lane);
          }
        }
    }
  }

  private interpolate(a: number, b: number, percent: number) { return a + (b - a) * percent; }
  private playerY: number = 0;

  private loop = (time: number = 0) => {
    if (!this.isPlaying) return;
    const dt = Math.min(1, (time - this.lastTime) / 1000);
    this.lastTime = time;
    
    this.update(GAME_SETTINGS.step); // Fixed timestep logic ideally, but simplified here
    this.render();
    
    this.animFrame = requestAnimationFrame(this.loop);
  }
  private lastTime: number = 0;
}
