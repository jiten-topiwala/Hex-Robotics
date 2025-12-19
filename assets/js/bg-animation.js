const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.id = 'bg-canvas';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-10'; // Behind everything
canvas.style.pointerEvents = 'none';

let width, height;
let hexRadius = 40; // Size of each hex
let hexagons = [];

// Mouse tracking
let mouse = { x: null, y: null };
// Target tilt values for smooth interpolation
let targetTilt = { x: 0, y: 0 };
let currentTilt = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Calculate tilt aimed at center (range -1 to 1)
    targetTilt.x = (e.clientX - width / 2) / (width / 2);
    targetTilt.y = (e.clientY - height / 2) / (height / 2);
});

// Pause interaction when hovering clickable elements
let isInteractionPaused = false;

document.body.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, textarea, .currency-switch, .dock-item')) {
        isInteractionPaused = true;
    }
});

document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, textarea, .currency-switch, .dock-item')) {
        isInteractionPaused = false;
    }
});

window.addEventListener('resize', resize);

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initGrid();
}

class Hexagon {
    constructor(x, y, r) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.r = r;
        this.highlight = 0; // 0 to 1
        this.lift = 0; // Simulated Z-height (0 to 15)
    }

    draw() {
        // Perspective Parallax Math
        // We shift the grid based on tilt to simulate depth
        // Far away things move less (or more depending on anchor). 
        // Let's anchor center and shift edges.
        const parallaxFactor = 20;
        const shiftX = -currentTilt.x * parallaxFactor;
        const shiftY = -currentTilt.y * parallaxFactor;

        const cx = this.baseX + shiftX;
        const cy = this.baseY + shiftY;

        // Lift Effect (Z-axis pop)
        // When lifted, the hex gets slightly bigger and moves "up" (towards camera/mouse)
        const scale = 1 + (this.lift / 150); // Slight size increase
        const liftOffset = -this.lift; // Move up Y slightly to simulate rising? Or just scale center.

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i + Math.PI / 6;
            const px = cx + (this.r * scale) * Math.cos(angle);
            const py = cy + (this.r * scale) * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Style Logic - Only fill if significant highlight
        if (this.highlight > 0.01) {
            // Active State: Orange Glow + "3D" Lift
            ctx.fillStyle = `rgba(255, 122, 26, ${this.highlight * 0.15})`;
            ctx.fill();

            // Stroke + Glow
            ctx.strokeStyle = `rgba(255, 122, 26, ${this.highlight})`;
            ctx.lineWidth = 1 + (this.highlight * 1.5);
            ctx.shadowBlur = this.highlight * 15;
            ctx.shadowColor = "rgba(255, 122, 26, 0.8)";
        } else {
            // Dormant State: Subtle grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
    }

    update() {
        // Decay highlight and lift (always happens)
        if (this.highlight > 0) this.highlight -= 0.03;
        if (this.lift > 0) this.lift -= 0.8;

        // Mouse Interaction - Only if NOT paused
        if (mouse.x != null && !isInteractionPaused) {
            const dx = mouse.x - this.baseX;
            const dy = mouse.y - this.baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                const intensity = (120 - dist) / 120; // 0 to 1

                if (intensity > this.highlight) {
                    this.highlight = intensity;
                    this.lift = intensity * 15; // Max 15px simulated lift
                }
            }
        }
    }
}

function initGrid() {
    hexagons = [];
    const hexW = hexRadius * Math.sqrt(3);
    const hexH = hexRadius * 2;
    const horizDist = hexW;
    const vertDist = hexH * 0.75;

    // Buffer for parallax movement
    const cols = Math.ceil(width / horizDist) + 4;
    const rows = Math.ceil(height / vertDist) + 4;

    const startX = -hexW;
    const startY = -hexH;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = startX + col * horizDist;
            let y = startY + row * vertDist;

            if (row % 2 === 1) x += horizDist / 2;

            hexagons.push(new Hexagon(x, y, hexRadius));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Smooth Tilt Interpolation
    currentTilt.x += (targetTilt.x - currentTilt.x) * 0.05;
    currentTilt.y += (targetTilt.y - currentTilt.y) * 0.05;

    for (let h of hexagons) {
        h.update();
        h.draw();
    }

    requestAnimationFrame(animate);
}

resize();
animate();
