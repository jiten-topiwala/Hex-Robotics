// Product Data
const productData = {
    // HEAVY DUTY
    "excavator": {
        title: "Autonomous Excavator",
        category: "Heavy Duty",
        desc: "AI-driven excavation with precise depth control.",
        specs: ["Payload: 20-60T", "Autonomy: Level 4", "Power: Hybrid Diesel-Electric"],
        video: "assets/videos/Excavator.mp4"
    },
    "crane": {
        title: "Smart Tower Crane",
        category: "Heavy Duty",
        desc: "Automated load balancing and anti-collision systems.",
        specs: ["Lift: 12T Max", "Height: 80m", "Wind Resistance: Class A"],
        video: "assets/videos/try.mp4"
    },
    "bulldozer": {
        title: "Grading Bulldozer",
        category: "Heavy Duty",
        desc: "GPS-guided grading for millimeter-perfect leveling.",
        specs: ["Blade: 4.2m", "Speed: 12km/h", "Connectivity: 5G Mesh"],
        video: "assets/videos/try.mp4"
    },
    // LIGHT WEIGHT
    "base": {
        title: "Universal Base Platform",
        category: "Light Weight",
        desc: "The core mobility unit. Compatible with all Hex tool modules.",
        specs: ["Battery: 48h Swap", "Drive: Omni-wheel", "IP Rating: IP67"],
        video: "assets/videos/All_in_one.mp4"
    },
    "drilling": { title: "Precision Drill Module", category: "Light Weight", desc: "For core sampling.", specs: ["Torque: 500Nm", "Depth: 2m"], video: "assets/videos/Drilling.mp4" },
    "painting": { title: "Spray Paint Module", category: "Light Weight", desc: "Uniform coverage.", specs: ["Flow: 2L/min", "Accuracy: 99%"], video: "assets/videos/Painting.mp4" },
    "demolition": { title: "Jackhammer Module", category: "Light Weight", desc: "Compact demolition.", specs: ["Force: 1200J", "Rate: 60Hz"], video: "assets/videos/Demolition.mp4" },
    "welding": { title: "Arc Weld Module", category: "Light Weight", desc: "Robotic welding.", specs: ["Amps: 300A", "Axis: 6-DOF"], video: "assets/videos/try.mp4" },
    // SURVEY
    "drone": {
        title: "Hex Sky Drone",
        category: "Survey & Mapping",
        desc: "Aerial photogrammetry and LiDAR scanning.",
        specs: ["Flight: 45min", "Sensor: LiDAR + RGB", "Range: 5km"],
        video: "assets/videos/survey_drone.mp4"
    },
    "rover": {
        title: "Terrain Rover",
        category: "Survey & Mapping",
        desc: "Ground-based inspection rover.",
        specs: ["Speed: 2m/s", "Sensors: Thermal/Gas", "Climb: 30°"],
        video: "assets/videos/try.mp4"
    },
    "ai": {
        title: "Site Analytics Platform",
        category: "Survey & Mapping",
        desc: "Centralized AI processing.",
        specs: ["Ops: 100 TFLOPS", "Latency: <10ms", "Cloud: Hybrid"],
        video: "assets/videos/All_in_one.mp4"
    }
};

const connectionMap = [
    { from: 'node-hub', to: 'node-heavy' },
    { from: 'node-hub', to: 'node-light' },
    { from: 'node-hub', to: 'node-survey' },
    { from: 'node-heavy', to: 'node-excavator' },
    { from: 'node-heavy', to: 'node-crane' },
    { from: 'node-heavy', to: 'node-bulldozer' },
    { from: 'node-survey', to: 'node-drone' },
    { from: 'node-survey', to: 'node-rover' },
    { from: 'node-survey', to: 'node-ai' },
    { from: 'node-light', to: 'node-base' },
    { from: 'node-base', to: 'node-drilling' },
    { from: 'node-base', to: 'node-painting' },
    { from: 'node-base', to: 'node-demolition' },
    { from: 'node-base', to: 'node-welding' }
];

// STATE
let axis = { x: 0, y: 0, scale: 1 };
let isPanning = false;
let startPoint = { x: 0, y: 0 };

document.addEventListener('DOMContentLoaded', () => {
    // 1. Init Connections
    drawConnections();
    window.addEventListener('resize', debounce(() => {
        drawConnections();
        // Reset pan on major resize if needed, or keeping it is fine
    }, 100));

    // 2. Init Nodes
    initNodes();

    // 3. Init Pan/Zoom
    initPanZoom();

    // 4. Close Panel
    const closeBtn = document.getElementById('panel-close');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
});

function debounce(func, wait) {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
}

// --- PAN / ZOOM ---
function initPanZoom() {
    const main = document.querySelector('.flowchart-main');
    const canvas = document.querySelector('.flowchart-canvas');
    if (!main || !canvas) return;

    // Mouse Down
    main.addEventListener('mousedown', (e) => {
        if (e.target.closest('.node') || e.target.closest('.detail-panel') || e.target.closest('.flow-controls')) return;
        isPanning = true;
        startPoint = { x: e.clientX - axis.x, y: e.clientY - axis.y };
        main.style.cursor = 'grabbing';
    });

    // Mouse Move
    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        axis.x = e.clientX - startPoint.x;
        axis.y = e.clientY - startPoint.y;
        updateTransform();
    });

    // Mouse Up
    window.addEventListener('mouseup', () => {
        isPanning = false;
        main.style.cursor = 'default';
    });

    // Wheel Zoom
    main.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(0.5, axis.scale + delta), 2); // Limit 0.5x to 2x
        axis.scale = newScale;
        updateTransform();
    }, { passive: false });

    // Controls
    document.getElementById('zoom-in')?.addEventListener('click', () => {
        axis.scale = Math.min(2, axis.scale + 0.2);
        updateTransform();
    });
    document.getElementById('zoom-out')?.addEventListener('click', () => {
        axis.scale = Math.max(0.5, axis.scale - 0.2);
        updateTransform();
    });
    document.getElementById('zoom-fit')?.addEventListener('click', () => {
        axis = { x: 0, y: 0, scale: 1 };
        updateTransform();
    });
}

function updateTransform() {
    const canvas = document.querySelector('.flowchart-canvas');
    if (canvas) {
        canvas.style.transform = `translate(${axis.x}px, ${axis.y}px) scale(${axis.scale})`;
        // Use requestAnimationFrame for smooth line updates during transform
        requestAnimationFrame(drawConnections);
    }
}

// --- CONNECTIONS (VIEWPORT-RELATIVE STABILIZATION) ---
function drawConnections() {
    const svg = document.getElementById('connections-svg');
    const main = document.querySelector('.flowchart-main');
    if (!svg || !main) return;

    // SVG matches the viewport container exactly
    const mainRect = main.getBoundingClientRect();
    svg.setAttribute('width', mainRect.width);
    svg.setAttribute('height', mainRect.height);

    if (getComputedStyle(svg).display === 'none') {
        svg.innerHTML = '';
        return;
    }

    svg.innerHTML = ''; // Clear

    connectionMap.forEach(conn => {
        const fromEl = document.getElementById(conn.from);
        const toEl = document.getElementById(conn.to);
        if (!fromEl || !toEl) return;

        const r1 = fromEl.getBoundingClientRect();
        const r2 = toEl.getBoundingClientRect();

        // Viewport-relative centers
        let x1 = (r1.left + r1.width / 2) - mainRect.left;
        let y1 = (r1.top + r1.height / 2) - mainRect.top;
        let x2 = (r2.left + r2.width / 2) - mainRect.left;
        let y2 = (r2.top + r2.height / 2) - mainRect.top;

        const w1 = r1.width;
        const h1 = r1.height;
        const w2 = r2.width;
        const h2 = r2.height;

        // Custom Anchor Logic for Visuals
        if (conn.from === 'node-hub') {
            if (conn.to.includes('heavy')) {
                x1 -= w1 * 0.35;
                y1 -= h1 * 0.25;
            } else if (conn.to.includes('survey')) {
                x1 += w1 * 0.35;
                y1 -= h1 * 0.25;
            } else {
                y1 += h1 * 0.45;
            }

            if (y2 > y1 + 50) y2 -= h2 / 2;
            else if (x2 < x1) x2 += w2 / 2;
            else if (x2 > x1) x2 -= w2 / 2;
        } else {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            x1 += Math.cos(angle) * (w1 / 2);
            y1 += Math.sin(angle) * (h1 / 2);
            x2 -= Math.cos(angle) * (w2 / 2);
            y2 -= Math.sin(angle) * (h2 / 2);
        }

        const dx = x2 - x1;
        const dy = y2 - y1;
        const tension = 0.5;

        let d = '';
        if (Math.abs(dx) > Math.abs(dy)) {
            d = `M ${x1} ${y1} C ${x1 + dx * tension} ${y1}, ${x2 - dx * tension} ${y2}, ${x2} ${y2}`;
        } else {
            d = `M ${x1} ${y1} C ${x1} ${y1 + dy * tension}, ${x2} ${y2 - dy * tension}, ${x2} ${y2}`;
        }

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', 'flow-line');
        path.setAttribute('data-target', conn.to);
        svg.appendChild(path);
    });
}

function initNodes() {
    document.querySelectorAll('.node').forEach(node => {
        node.addEventListener('mouseenter', () => {
            // Highlight
            const id = node.id;
            document.querySelectorAll(`.flow-line[data-target="${id}"]`).forEach(l => l.classList.add('active'));
            const video = node.querySelector('video');
            if (video) video.play().catch(() => { });
        });
        node.addEventListener('mouseleave', () => {
            document.querySelectorAll('.flow-line').forEach(l => l.classList.remove('active'));
            const video = node.querySelector('video');
            if (video) video.pause();
        });
        node.addEventListener('click', (e) => {
            if (isPanning) return; // Don't open if dragging
            const pid = node.dataset.product || node.dataset.category;
            if (pid && productData[pid]) openPanel(pid);
        });
    });
}

function openPanel(id) {
    const data = productData[id];
    const panel = document.getElementById('detail-panel');
    if (!panel) return;

    panel.innerHTML = `
      <button class="panel-close" id="panel-close-dynamic">×</button>
      <div class="panel-header">
        <span class="panel-category">${data.category}</span>
        <h2 class="panel-title">${data.title}</h2>
        <p class="panel-desc">${data.desc}</p>
      </div>
      <div class="panel-body">
        <div class="panel-section"><h3>Specs</h3><ul class="features-list">${data.specs.map(s => `<li>${s}</li>`).join('')}</ul></div>
        <div class="panel-section"><h3>Media</h3><div class="video-box"><video src="${data.video}" controls poster="assets/images/tech_placeholder.png" style="width:100%"></video></div></div>
      </div>
    `;
    document.getElementById('panel-close-dynamic').addEventListener('click', closePanel);
    panel.classList.add('open');
}

function closePanel() {
    document.getElementById('detail-panel').classList.remove('open');
}
