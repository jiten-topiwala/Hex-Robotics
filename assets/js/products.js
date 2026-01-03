/* =========================================================
   Hex Robotics — Products Page JavaScript
   - Category tab switching
   - Product detail panel interactions
   - Smooth animations
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initCategoryTabs();
    initProductCards();
    initDetailPanel();
    initScrollAnimations();
});

/* ---------- Category Tab Switching ---------- */
function initCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    const sections = document.querySelectorAll('.category-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding section with animation
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `category-${category}`) {
                    section.classList.add('active');
                    // Scroll to section smoothly
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    });
}

/* ---------- Product Card Interactions ---------- */
function initProductCards() {
    // Heavy duty product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const expandBtn = card.querySelector('.product-expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openProductPanel(card.dataset.product, 'Heavy Duty');
            });
        }
        card.addEventListener('click', () => {
            openProductPanel(card.dataset.product, 'Heavy Duty');
        });
    });

    // Light weight arm cards
    const armCards = document.querySelectorAll('.arm-card');
    armCards.forEach(card => {
        const expandBtn = card.querySelector('.arm-expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openProductPanel(card.dataset.product, 'Light Weight');
            });
        }
        card.addEventListener('click', () => {
            openProductPanel(card.dataset.product, 'Light Weight');
        });
    });

    // Survey cards
    const surveyCards = document.querySelectorAll('.survey-card');
    surveyCards.forEach(card => {
        const expandBtn = card.querySelector('.survey-expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openProductPanel(card.dataset.product, 'Survey & Mapping');
            });
        }
        card.addEventListener('click', () => {
            openProductPanel(card.dataset.product, 'Survey & Mapping');
        });
    });
}

/* ---------- Product Detail Panel ---------- */
const productData = {
    // Heavy Duty
    excavator: {
        category: 'Heavy Duty',
        title: 'Excavator Automation',
        subtitle: 'Transform your excavator into an intelligent machine',
        features: [
            'Works with any brand excavator (20-60 ton)',
            'Ultra-low latency remote control (<100ms)',
            'Progressive autonomy from teleoperation to full automation',
            'Retrofit installation — no machine replacement needed',
            'Real-time obstacle detection and collision avoidance'
        ],
        tech: [
            { icon: '📡', label: 'Sensor Fusion' },
            { icon: '🛰️', label: 'GPS-RTK' },
            { icon: '👁️', label: 'Computer Vision' },
            { icon: '🕹️', label: 'Remote Control' }
        ],
        specs: {
            'Machine Compatibility': '20-60 ton excavators',
            'Control Latency': '<100ms',
            'Operational Range': 'Up to 50km (with network)',
            'Installation Time': '2-3 days'
        }
    },
    crane: {
        category: 'Heavy Duty',
        title: 'Crane Automation',
        subtitle: 'Precision lifting with intelligent load control',
        features: [
            'Advanced anti-sway algorithms for stable lifting',
            'Real-time load weight and center of gravity monitoring',
            'Precision positioning within ±5mm accuracy',
            'Collision avoidance with 360° awareness',
            'Remote operation from control room or mobile device'
        ],
        tech: [
            { icon: '⚖️', label: 'Load Cells' },
            { icon: '🎯', label: 'IMU Sensors' },
            { icon: '📷', label: 'Vision System' },
            { icon: '🔒', label: 'Safety Interlocks' }
        ],
        specs: {
            'Load Capacity': 'Up to 500 tons',
            'Positioning Accuracy': '±5mm',
            'Anti-Sway Reduction': '95%',
            'Response Time': '<50ms'
        }
    },
    bulldozer: {
        category: 'Heavy Duty',
        title: 'Bulldozer Control',
        subtitle: 'Automated grading and earth moving',
        features: [
            'Automatic grade control with cm-level precision',
            'LiDAR-based terrain mapping and planning',
            'Path optimization for efficient material movement',
            'Remote teleoperation for hazardous environments',
            'Integration with site design models (BIM)'
        ],
        tech: [
            { icon: '🛰️', label: 'GPS-RTK' },
            { icon: '📡', label: 'LiDAR' },
            { icon: '🗺️', label: 'Terrain Mapping' },
            { icon: '📐', label: 'BIM Integration' }
        ],
        specs: {
            'Grade Accuracy': '±2cm',
            'Terrain Update Rate': '10Hz',
            'Operational Range': 'Unlimited (network)',
            'Setup Time': '1 day'
        }
    },

    // Light Weight
    drilling: {
        category: 'Light Weight',
        title: 'Drilling System',
        subtitle: 'Precision boring with intelligent torque control',
        features: [
            'Multiple drill bit sizes supported (6-50mm)',
            'Automatic torque sensing and adjustment',
            'Depth control with ±1mm precision',
            'Built-in dust extraction system',
            'Hot-swap in under 5 minutes'
        ],
        tech: [
            { icon: '🔧', label: 'Torque Control' },
            { icon: '📏', label: 'Depth Sensor' },
            { icon: '💨', label: 'Dust Extraction' },
            { icon: '🔌', label: 'Quick Connect' }
        ],
        specs: {
            'Drill Diameter': '6-50mm',
            'Depth Accuracy': '±1mm',
            'Max Torque': '150Nm',
            'Swap Time': '<5 min'
        }
    },
    demolition: {
        category: 'Light Weight',
        title: 'Demolition Arm',
        subtitle: 'Controlled breaking with force limiting',
        features: [
            'Variable force impact for controlled demolition',
            'Vibration dampening for structural safety',
            'Debris handling and sorting capability',
            'Dust suppression system integration',
            'Real-time structural stress monitoring'
        ],
        tech: [
            { icon: '💪', label: 'Force Control' },
            { icon: '📊', label: 'Vibration Sensors' },
            { icon: '🛡️', label: 'Safety Limits' },
            { icon: '🔄', label: 'Quick Release' }
        ],
        specs: {
            'Impact Force': 'Up to 5000N',
            'Vibration Reduction': '80%',
            'Working Radius': '2.5m',
            'Weight': '45kg'
        }
    },
    painting: {
        category: 'Light Weight',
        title: 'Painting System',
        subtitle: 'Uniform coverage with smart edge detection',
        features: [
            'Automatic edge detection for clean lines',
            'Spray pattern optimization for uniform coverage',
            'Color matching and mixing capability',
            'Wall texture adaptation',
            '360° coverage without repositioning'
        ],
        tech: [
            { icon: '🎨', label: 'Color Matching' },
            { icon: '👁️', label: 'Edge Detection' },
            { icon: '💨', label: 'Spray Control' },
            { icon: '📐', label: 'Surface Mapping' }
        ],
        specs: {
            'Coverage Rate': '15 m²/hour',
            'Edge Precision': '±2mm',
            'Paint Types': 'Water/Oil based',
            'Tank Capacity': '20L'
        }
    },
    welding: {
        category: 'Light Weight',
        title: 'Welding Module',
        subtitle: 'Automated welding with precise heat control',
        features: [
            'MIG/TIG welding capability',
            'Adaptive heat control for different materials',
            'Seam tracking with vision guidance',
            'Multi-pass welding support',
            'Weld quality inspection integration'
        ],
        tech: [
            { icon: '🔥', label: 'Heat Control' },
            { icon: '👁️', label: 'Seam Tracking' },
            { icon: '📊', label: 'Quality Check' },
            { icon: '⚡', label: 'Power Module' }
        ],
        specs: {
            'Welding Types': 'MIG/TIG',
            'Material Thickness': '1-12mm',
            'Seam Accuracy': '±0.5mm',
            'Duty Cycle': '60%'
        }
    },

    // Survey & Mapping
    drone: {
        category: 'Survey & Mapping',
        title: 'Survey Drones',
        subtitle: 'Autonomous aerial mapping and inspection',
        features: [
            '45-minute flight time per charge',
            '4K camera with 20MP photo capability',
            'LiDAR scanning for 3D point clouds',
            'RTK-GPS for cm-level positioning',
            'Autonomous flight path planning'
        ],
        tech: [
            { icon: '🛰️', label: 'RTK-GPS' },
            { icon: '📷', label: '4K Camera' },
            { icon: '📡', label: 'LiDAR' },
            { icon: '🤖', label: 'Auto-Pilot' }
        ],
        specs: {
            'Flight Time': '45 minutes',
            'Camera': '4K / 20MP',
            'Position Accuracy': '±2cm',
            'Wind Resistance': 'Up to 35km/h'
        }
    },
    rover: {
        category: 'Survey & Mapping',
        title: 'Ground Rovers',
        subtitle: 'Continuous ground-level site monitoring',
        features: [
            '8-hour continuous operation',
            'High-precision laser scanning',
            'SLAM navigation in complex environments',
            'Automatic docking and charging',
            'All-terrain wheel system'
        ],
        tech: [
            { icon: '📡', label: 'Laser Scanner' },
            { icon: '🗺️', label: 'SLAM Nav' },
            { icon: '🔋', label: 'Auto-Dock' },
            { icon: '🛞', label: 'All-Terrain' }
        ],
        specs: {
            'Runtime': '8 hours',
            'Scan Range': '100m radius',
            'Positioning': '±1cm',
            'Max Speed': '5 km/h'
        }
    },
    'ai-platform': {
        category: 'Survey & Mapping',
        title: 'AI Analysis Platform',
        subtitle: 'Intelligent insights from site data',
        features: [
            'Digital twin creation from drone/rover data',
            'Real-time progress tracking vs. schedule',
            'Anomaly detection for quality issues',
            'Predictive maintenance alerts',
            'Cloud-based with on-premise option'
        ],
        tech: [
            { icon: '🧠', label: 'ML Models' },
            { icon: '☁️', label: 'Cloud Processing' },
            { icon: '🔔', label: 'Real-time Alerts' },
            { icon: '📊', label: 'Analytics' }
        ],
        specs: {
            'Processing': 'Cloud + Edge',
            'Update Frequency': 'Real-time',
            'Data Retention': '5 years',
            'API Access': 'REST + GraphQL'
        }
    }
};

function initDetailPanel() {
    const panel = document.getElementById('product-panel');
    const overlay = document.getElementById('panel-overlay');
    const closeBtn = panel.querySelector('.panel-close-btn');

    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePanel();
    });
}

function openProductPanel(productId, category) {
    const panel = document.getElementById('product-panel');
    const overlay = document.getElementById('panel-overlay');
    const data = productData[productId];

    if (!data) {
        console.warn(`No data found for product: ${productId}`);
        return;
    }

    // Update panel content
    updatePanelContent(data);

    // Open panel
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closePanel() {
    const panel = document.getElementById('product-panel');
    const overlay = document.getElementById('panel-overlay');

    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function updatePanelContent(data) {
    const panel = document.getElementById('product-panel');

    // Update badge
    const badge = panel.querySelector('.panel-badge');
    badge.textContent = data.category;

    // Update title and subtitle
    const title = panel.querySelector('.panel-title');
    const subtitle = panel.querySelector('.panel-subtitle');
    title.textContent = data.title;
    subtitle.textContent = data.subtitle;

    // Update features
    const featureList = panel.querySelector('.feature-list');
    featureList.innerHTML = data.features.map(feature => `
    <li>
      <span class="feature-icon">✓</span>
      <span>${feature}</span>
    </li>
  `).join('');

    // Update tech grid
    const techGrid = panel.querySelector('.tech-grid');
    techGrid.innerHTML = data.tech.map(tech => `
    <div class="tech-item">
      <span class="tech-icon">${tech.icon}</span>
      <span class="tech-label">${tech.label}</span>
    </div>
  `).join('');

    // Update specs table
    const specsTable = panel.querySelector('.specs-table');
    specsTable.innerHTML = Object.entries(data.specs).map(([key, value]) => `
    <tr>
      <td>${key}</td>
      <td>${value}</td>
    </tr>
  `).join('');
}

/* ---------- Scroll Animations ---------- */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe product cards
    document.querySelectorAll('.product-card, .arm-card, .survey-card').forEach(card => {
        observer.observe(card);
    });
}

/* ---------- Footer Year ---------- */
const footerYear = document.getElementById('footer-year');
if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
}
