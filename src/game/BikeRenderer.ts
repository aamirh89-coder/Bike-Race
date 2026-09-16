export class BikeRenderer {
  /**
   * Renders a futuristic / realistic racing bike from a rear perspective.
   */
  static drawBike(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    resolution: number,
    destX: number,
    destY: number,
    scale: number,
    leanAngle: number,
    color: string,
    isPlayer: boolean
  ) {
    ctx.save();
    
    // Move to bike center base
    ctx.translate(destX, destY);
    // Apply lean rotation (bank into the curve)
    ctx.rotate(leanAngle);
    // Scale based on depth (Z)
    ctx.scale(scale * width * 1.5, scale * width * 1.5);

    // Draw shadow
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- REAR TIRE (Thick sportbike tire) ---
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.roundRect(-22, -55, 44, 55, 10);
    ctx.fill();
    
    // Tire treads (V-shape grooves commonly seen from behind)
    ctx.strokeStyle = '#0f0f0f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, -15); ctx.lineTo(0, -25); ctx.lineTo(15, -15);
    ctx.moveTo(-15, -35); ctx.lineTo(0, -45); ctx.lineTo(15, -35);
    ctx.stroke();

    // Swingarm & Axle
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(0, -25, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#555';
    ctx.fillRect(-30, -30, 8, 20); // Left swingarm
    ctx.fillRect(22, -30, 8, 20); // Right swingarm
    
    // Chain drive on left
    ctx.fillStyle = '#222';
    ctx.fillRect(-32, -25, 4, 30);

    // Exhaust (Protruding backwards and rightwards)
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(25, -40);
    ctx.lineTo(40, -50);
    ctx.lineTo(44, -38);
    ctx.lineTo(28, -28);
    ctx.fill();
    
    // Exhaust hole
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(42, -44, 3, 6, Math.PI/6, 0, Math.PI*2);
    ctx.fill();
    
    if (isPlayer && scale > 0.005) { // flame effect
        ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.beginPath();
        ctx.moveTo(42, -44);
        ctx.lineTo(55, -40);
        ctx.lineTo(48, -30);
        ctx.fill();
    }

    // --- BIKE BODY (Tail Cowl) ---
    // Pointy aerodynamic sportbike rear
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -110); 
    ctx.lineTo(26, -70); 
    ctx.lineTo(12, -55);
    ctx.lineTo(-12, -55);
    ctx.lineTo(-26, -70);
    ctx.closePath();
    ctx.fill();
    
    // License plate & mudguard holder
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(-10, -55);
    ctx.lineTo(10, -55);
    ctx.lineTo(15, -45);
    ctx.lineTo(-15, -45);
    ctx.fill();
    ctx.fillStyle = '#e0e0e0'; // The plate itself
    ctx.fillRect(-8, -52, 16, 6);
    
    // Tail lights (Twin LED style)
    ctx.fillStyle = isPlayer ? '#FF0000' : '#bb0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 15;
    ctx.fillRect(-12, -75, 10, 6);
    ctx.fillRect(2, -75, 10, 6);
    ctx.shadowBlur = 0;

    // --- RIDER (Viewed from back) ---
    
    // Leather racing pants/legs hugging the tank
    ctx.fillStyle = '#151515';
    ctx.beginPath();
    ctx.roundRect(-35, -90, 16, 40, 6); // Left leg
    ctx.roundRect(19, -90, 16, 40, 6); // Right leg
    ctx.fill();

    // Jacket back
    ctx.fillStyle = isPlayer ? '#222' : '#333';
    ctx.beginPath();
    ctx.moveTo(-28, -85); // Waist left
    ctx.lineTo(-32, -145); // Shoulder left
    ctx.lineTo(32, -145); // Shoulder right
    ctx.lineTo(28, -85); // Waist right
    ctx.closePath();
    ctx.fill();

    // Aerodynamic racing hump on the upper back (classic sportbike feature)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(0, -115, 14, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // V-shaped jacket accents mirroring bike color
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-28, -140);
    ctx.lineTo(0, -110);
    ctx.lineTo(28, -140);
    ctx.stroke();

    // Rider Arms (jutting out for clip-on handlebars)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.roundRect(-48, -135, 16, 45, 6); // Left arm
    ctx.roundRect(32, -135, 16, 45, 6); // Right arm
    ctx.fill();

    // Helmet (Round with rear spoilers)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(0, -165, 24, 0, Math.PI * 2);
    ctx.fill();
    
    // Helmet aero spoiler
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, -155, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Visor strap / helmet detail
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -165, 20, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    ctx.restore();
  }
}
