const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouse = { x: 0, y: 0, influence: 0 };
let nodes = [];
let meteors = [];
let lastMeteor = 0;
let time = 0;

const colors = {
  primary: '#e0aaff',
  secondary: '#c77dff',
  accent: '#9d4edd',
  background: '#0f0f23',
  meteor: '#ff6b6b'
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

class Node {
  constructor(x, y, size = 2) {
    this.x = x || Math.random() * width;
    this.y = y || Math.random() * height;
    this.originalX = this.x;
    this.originalY = this.y;
    this.size = size;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.life = 1;
    this.pulse = Math.random() * Math.PI * 2;
    this.depth = Math.random() * 0.8 + 0.2;
    this.connected = [];
    this.driftSpeedX = (Math.random() - 0.5) * 0.1;
    this.driftSpeedY = (Math.random() - 0.5) * 0.1;
    this.driftRange = Math.random() * 20 + 10;
  }

  update() {
    // Background drift for non-user nodes
    if (this.terrainType !== 'user-created') {
      const driftX = Math.sin(time * this.driftSpeedX) * this.driftRange * 0.001;
      const driftY = Math.cos(time * this.driftSpeedY) * this.driftRange * 0.001;
      this.originalX += driftX;
      this.originalY += driftY;
    }

    // Mouse influence
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = this.terrainType === 'peak' ? 200 : 150;

    if (distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance;
      const angle = Math.atan2(dy, dx);
      const sensitivity = this.terrainType === 'boundary' ? 0.01 : 0.02;
      this.vx += Math.cos(angle) * force * sensitivity;
      this.vy += Math.sin(angle) * force * sensitivity;
    }

    // Movement and physics
    const moveStrength = this.intensity || 0.5;
    this.x += this.vx * moveStrength;
    this.y += this.vy * moveStrength;

    // Return to original position
    const returnForce = this.terrainType === 'peak' ? 0.002 : 0.001;
    this.vx += (this.originalX - this.x) * returnForce;
    this.vy += (this.originalY - this.y) * returnForce;

    // Damping
    const damping = this.terrainType === 'boundary' ? 0.95 : 0.98;
    this.vx *= damping;
    this.vy *= damping;

    // Boundary handling
    const margin = this.size * 2;
    if (this.x < margin) { this.vx += 0.01; this.x = margin; }
    if (this.x > width - margin) { this.vx -= 0.01; this.x = width - margin; }
    if (this.y < margin) { this.vy += 0.01; this.y = margin; }
    if (this.y > height - margin) { this.vy -= 0.01; this.y = height - margin; }

    this.pulse += this.pulseSpeed || 0.02;
    this.connected = [];
  }

  draw() {
    const pulseSize = this.size + Math.sin(this.pulse) * 0.5;
    const alpha = this.life * this.depth;
    const { color, glowIntensity } = this.getTerrainStyle();

    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow effect
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, pulseSize * 3 * glowIntensity);
    gradient.addColorStop(0, color + '80');
    gradient.addColorStop(0.5, color + '40');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize * 3 * glowIntensity, 0, Math.PI * 2);
    ctx.fill();

    // Core node
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getTerrainStyle() {
    const styles = {
      peak: { color: colors.primary, glowIntensity: 1.5 },
      highland: { color: colors.secondary, glowIntensity: 1.2 },
      valley: { color: colors.accent, glowIntensity: 0.8 },
      lowland: { color: colors.secondary, glowIntensity: 0.6 },
      cluster: { color: colors.primary, glowIntensity: 1.3 },
      boundary: { color: colors.accent, glowIntensity: 0.7 },
      micro: { color: colors.secondary, glowIntensity: 0.4 },
      'user-created': { color: colors.primary, glowIntensity: 1.4 }
    };
    return styles[this.terrainType] || styles.highland;
  }
}

class Meteor {
  constructor() {
    this.x = Math.random() * width + width;
    this.y = Math.random() * height * 0.3;
    this.vx = -Math.random() * 8 - 4;
    this.vy = Math.random() * 4 + 2;
    this.size = Math.random() * 3 + 2;
    this.life = 1;
    this.trail = [];
    this.sparkles = [];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1;

    // Trail management
    this.trail.push({ x: this.x, y: this.y, life: 1 });
    if (this.trail.length > 20) this.trail.shift();
    this.trail.forEach(point => point.life -= 0.05);
    this.trail = this.trail.filter(point => point.life > 0);

    // Sparkles
    if (Math.random() < 0.3) {
      this.sparkles.push({
        x: this.x + (Math.random() - 0.5) * 10,
        y: this.y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        size: Math.random() * 2 + 1
      });
    }

    this.sparkles.forEach(sparkle => {
      sparkle.x += sparkle.vx;
      sparkle.y += sparkle.vy;
      sparkle.life -= 0.02;
    });
    this.sparkles = this.sparkles.filter(sparkle => sparkle.life > 0);

    this.life = (this.x > -100 && this.y < height + 100) ? 1 : 0;
  }

  draw() {
    ctx.save();

    // Draw trail
    this.trail.forEach(point => {
      const alpha = point.life * 0.5;
      const size = this.size * point.life;
      ctx.globalAlpha = alpha;

      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 3);
      gradient.addColorStop(0, colors.meteor + 'ff');
      gradient.addColorStop(0.5, colors.meteor + '80');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw sparkles
    this.sparkles.forEach(sparkle => {
      ctx.globalAlpha = sparkle.life;
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw meteor core
    ctx.globalAlpha = 1;
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, colors.meteor);
    gradient.addColorStop(1, colors.meteor + '80');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawConnections() {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 120;

      if (distance < maxDistance) {
        const alpha = (1 - distance / maxDistance) * 0.3;
        const mouseDistance = Math.sqrt(
          Math.pow(mouse.x - (nodes[i].x + nodes[j].x) / 2, 2) +
          Math.pow(mouse.y - (nodes[i].y + nodes[j].y) / 2, 2)
        );
        const mouseInfluence = Math.max(0, 1 - mouseDistance / 200);

        ctx.save();
        ctx.globalAlpha = alpha + mouseInfluence * 0.2;

        const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        gradient.addColorStop(0, colors.secondary);
        gradient.addColorStop(0.5, colors.accent);
        gradient.addColorStop(1, colors.primary);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + mouseInfluence;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();

        ctx.restore();
        nodes[i].connected.push(nodes[j]);
        nodes[j].connected.push(nodes[i]);
      }
    }
  }
}

function noise(x, y) {
  const freq = 0.01;
  let value = 0, amplitude = 1, frequency = freq;

  for (let i = 0; i < 4; i++) {
    value += amplitude * (Math.sin(x * frequency) * Math.cos(y * frequency) +
      Math.sin(x * frequency * 2.1 + 1.7) * Math.cos(y * frequency * 1.9 + 2.3));
    amplitude *= 0.5;
    frequency *= 2;
  }

  return (value + 1) / 2;
}

function generateTerrainNodes() {
  nodes = [];
  const density = Math.min(width * height / 50000, 1);
  const baseNodeCount = Math.floor(40 + density * 40);
  const zones = [];

  // Generate terrain zones
  for (let x = 0; x < width; x += 80) {
    for (let y = 0; y < height; y += 80) {
      const noiseValue = noise(x, y);
      if (noiseValue > 0.3) {
        zones.push({
          x: x + (Math.random() - 0.5) * 25,
          y: y + (Math.random() - 0.5) * 25,
          intensity: noiseValue,
          type: getTerrainType(noiseValue)
        });
      }
    }
  }

  // Create nodes from zones
  zones.sort((a, b) => b.intensity - a.intensity);
  zones.slice(0, Math.min(baseNodeCount, zones.length)).forEach(zone => {
    const node = new Node(
      Math.max(10, Math.min(width - 10, zone.x)),
      Math.max(10, Math.min(height - 10, zone.y)),
      getNodeSize(zone.type, zone.intensity)
    );
    node.terrainType = zone.type;
    node.intensity = zone.intensity;
    node.pulseSpeed = 0.02 + zone.intensity * 0.03;
    nodes.push(node);
  });

  addOrganicClusters();
  addBoundaryNodes();
  addMicroNodes();
}

function getTerrainType(noiseValue) {
  if (noiseValue > 0.8) return 'peak';
  if (noiseValue > 0.6) return 'highland';
  if (noiseValue > 0.4) return 'valley';
  return 'lowland';
}

function getNodeSize(terrainType, intensity) {
  const baseSizes = {
    peak: 3 + intensity * 2,
    highland: 2 + intensity * 1.5,
    valley: 1.5 + intensity,
    lowland: 1 + intensity * 0.5,
    micro: 0.5 + intensity * 0.3
  };
  return baseSizes[terrainType] || 2;
}

function addOrganicClusters() {
  const clusterCount = Math.floor(Math.random() * 3) + 2;
  for (let c = 0; c < clusterCount; c++) {
    const centerX = Math.random() * width;
    const centerY = Math.random() * height;
    const clusterSize = Math.floor(Math.random() * 3) + 2;
    const clusterRadius = Math.random() * 80 + 40;

    for (let i = 0; i < clusterSize; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * clusterRadius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      if (x > 0 && x < width && y > 0 && y < height && !isTooClose(x, y, 50)) {
        const node = new Node(x, y, Math.random() * 2 + 1.5);
        node.terrainType = 'cluster';
        nodes.push(node);
      }
    }
  }
}

function addBoundaryNodes() {
  const edgeNodes = Math.floor(Math.random() * 8) + 4;
  for (let i = 0; i < edgeNodes; i++) {
    const { x, y } = getRandomEdgePosition();
    if (!isTooClose(x, y, 60)) {
      const node = new Node(x, y, Math.random() * 1.5 + 1);
      node.terrainType = 'boundary';
      nodes.push(node);
    }
  }
}

function addMicroNodes() {
  const microNodeCount = Math.floor(width * height / 15000);
  for (let i = 0; i < microNodeCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const microNoiseValue = noise(x * 1.5, y * 1.5);

    if (microNoiseValue > 0.2 && microNoiseValue < 0.7 && !isTooClose(x, y, 30)) {
      const node = new Node(x, y, Math.random() * 0.8 + 0.5);
      node.terrainType = 'micro';
      node.intensity = microNoiseValue;
      node.pulseSpeed = 0.01 + microNoiseValue * 0.02;
      nodes.push(node);
    }
  }
}

function isTooClose(x, y, minDistance) {
  return nodes.some(node => {
    const dx = node.x - x;
    const dy = node.y - y;
    return Math.sqrt(dx * dx + dy * dy) < minDistance;
  });
}

function getRandomEdgePosition() {
  const margin = 100;
  const edge = Math.floor(Math.random() * 4);
  const positions = [
    { x: Math.random() * width, y: Math.random() * margin }, // top
    { x: width - Math.random() * margin, y: Math.random() * height }, // right
    { x: Math.random() * width, y: height - Math.random() * margin }, // bottom
    { x: Math.random() * margin, y: Math.random() * height } // left
  ];
  return positions[edge];
}


export function init() {
  resize();
  generateTerrainNodes();

  let lastWidth = width, lastHeight = height;
  const originalResize = resize;
  resize = function () {
    originalResize();
    if (Math.abs(width - lastWidth) > 200 || Math.abs(height - lastHeight) > 200) {
      generateTerrainNodes();
      lastWidth = width;
      lastHeight = height;
    }
  };
}

export function animate() {
  time += 0.01;
  ctx.clearRect(0, 0, width, height);

  nodes.forEach(node => {
    node.update();
    node.draw();
  });

  drawConnections();

  meteors = meteors.filter(meteor => {
    meteor.update();
    meteor.draw();
    return meteor.life > 0;
  });

  const now = Date.now();
  if (Math.random() < 0.001 && now - lastMeteor > 5000) {
    meteors.push(new Meteor());
    lastMeteor = now;
  }

  requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  let totalInfluence = 0;
  nodes.forEach(node => {
    const dx = mouse.x - node.x;
    const dy = mouse.y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 150) {
      totalInfluence += (150 - distance) / 150;
    }
  });

  mouse.influence = Math.min(1, totalInfluence / 10);
});

window.addEventListener('click', () => {
  /*
  for (let i = 0; i < 3; i++) {
    const newNode = new Node(
      mouse.x + (Math.random() - 0.5) * 50,
      mouse.y + (Math.random() - 0.5) * 50,
      Math.random() * 3 + 2
    );
    newNode.terrainType = 'user-created';
    nodes.push(newNode);
  }*/
});