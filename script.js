
const gameArea = document.getElementById("gameArea");
const cake = document.getElementById("cake");
const spoon = document.getElementById("spoon");
const gameStatus = document.getElementById("gameStatus");

const partyButton = document.getElementById("partyButton");
const partyMessage = document.getElementById("partyMessage");

const SIZE = 55;
const RADIUS = SIZE / 2;

let cakeX = 0;
let cakeY = 0;

let spoonX = 70;
let spoonY = 90;

let velocityX = 2;
let velocityY = 1.5;

let lastTaunt = 0;
let animationFrame = null;

const MAX_SPEED = 4.8;
const ACCELERATION = 0.12;
const WALL_ZONE = 100;

const taunts = [
  "Too slow.",
  "Nice attempt.",
  "The cake has other plans.",
  "Skill issue.",
  "Not today, Kozel.",
  "You almost had it. Almost.",
  "This cake has places to be."
];

function getBounds() {
  return {
    width: Math.max(RADIUS * 2, gameArea.clientWidth),
    height: Math.max(RADIUS * 2, gameArea.clientHeight)
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setupGame() {
  const bounds = getBounds();

  cakeX = bounds.width * 0.68;
  cakeY = bounds.height * 0.4;

  spoonX = bounds.width * 0.15;
  spoonY = bounds.height * 0.4;

  velocityX = 2;
  velocityY = 1.5;

  drawPositions();
}

function drawPositions() {
  cake.style.left = `${cakeX - RADIUS}px`;
  cake.style.top = `${cakeY - RADIUS}px`;

  spoon.style.left = `${spoonX - RADIUS}px`;
  spoon.style.top = `${spoonY - RADIUS}px`;
}

function moveSpoon(event) {
  const rect = gameArea.getBoundingClientRect();
  const bounds = getBounds();

  spoonX = clamp(
    event.clientX - rect.left,
    RADIUS,
    bounds.width - RADIUS
  );

  spoonY = clamp(
    event.clientY - rect.top,
    RADIUS,
    bounds.height - RADIUS
  );

  drawPositions();
}

gameArea.addEventListener("pointermove", moveSpoon);
gameArea.addEventListener("pointerdown", moveSpoon);

function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;

  return {
    x: x / length,
    y: y / length
  };
}

function getEscapeDirection() {
  const bounds = getBounds();

  // Direction away from the spoon.
  const dx = cakeX - spoonX;
  const dy = cakeY - spoonY;

  const distance = Math.hypot(dx, dy) || 1;

  let directionX = dx / distance;
  let directionY = dy / distance;

  // Wall avoidance. The closer the cake gets to a wall,
  // the more strongly it turns towards the centre.
  const left = cakeX;
  const right = bounds.width - cakeX;
  const top = cakeY;
  const bottom = bounds.height - cakeY;

  const wallStrength = (edgeDistance) => {
    if (edgeDistance >= WALL_ZONE) return 0;

    return (WALL_ZONE - edgeDistance) / WALL_ZONE;
  };

  const leftForce = wallStrength(left);
  const rightForce = wallStrength(right);
  const topForce = wallStrength(top);
  const bottomForce = wallStrength(bottom);

  directionX += leftForce * 2;
  directionX -= rightForce * 2;

  directionY += topForce * 2;
  directionY -= bottomForce * 2;

  return normalize(directionX, directionY);
}

function updateCake() {
  const bounds = getBounds();

  const direction = getEscapeDirection();

  // The cake smoothly accelerates towards its escape direction.
  const targetX = direction.x * MAX_SPEED;
  const targetY = direction.y * MAX_SPEED;

  velocityX += (targetX - velocityX) * ACCELERATION;
  velocityY += (targetY - velocityY) * ACCELERATION;

  cakeX += velocityX;
  cakeY += velocityY;

  // Hard boundary protection.
  // This prevents the cake from ever becoming stuck outside the area.
  if (cakeX < RADIUS) {
    cakeX = RADIUS;
    velocityX = Math.abs(velocityX);
  }

  if (cakeX > bounds.width - RADIUS) {
    cakeX = bounds.width - RADIUS;
    velocityX = -Math.abs(velocityX);
  }

  if (cakeY < RADIUS) {
    cakeY = RADIUS;
    velocityY = Math.abs(velocityY);
  }

  if (cakeY > bounds.height - RADIUS) {
    cakeY = bounds.height - RADIUS;
    velocityY = -Math.abs(velocityY);
  }

  drawPositions();

  // Distance-based taunts.
  const distance = Math.hypot(cakeX - spoonX, cakeY - spoonY);

  if (distance < 85 && Date.now() - lastTaunt > 1800) {
    gameStatus.textContent =
      taunts[Math.floor(Math.random() * taunts.length)];

    lastTaunt = Date.now();
  }
}

function gameLoop() {
  updateCake();
  animationFrame = requestAnimationFrame(gameLoop);
}

// Start the game.
setupGame();
gameLoop();

// Reposition everything safely when the screen changes size.
window.addEventListener("resize", () => {
  const bounds = getBounds();

  cakeX = clamp(cakeX, RADIUS, bounds.width - RADIUS);
  cakeY = clamp(cakeY, RADIUS, bounds.height - RADIUS);

  spoonX = clamp(spoonX, RADIUS, bounds.width - RADIUS);
  spoonY = clamp(spoonY, RADIUS, bounds.height - RADIUS);

  drawPositions();
});

// Birthday surprise.
partyButton.addEventListener("click", () => {
  partyMessage.classList.remove("hidden");

  partyButton.textContent = "Happy birthday, Kozel!";
  partyButton.disabled = true;

  createConfetti();
});

// Confetti effect.
function createConfetti() {
  const symbols = ["✳", "✦", "·", "✧", "✺"];
  const colours = ["#d5c69b", "#a6b596", "#e9e4d6"];

  for (let i = 0; i < 45; i++) {
    const particle = document.createElement("span");

    particle.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    particle.style.position = "fixed";
    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = "-20px";
    particle.style.zIndex = "99";
    particle.style.pointerEvents = "none";
    particle.style.color =
      colours[Math.floor(Math.random() * colours.length)];
    particle.style.fontSize = (12 + Math.random() * 16) + "px";

    document.body.appendChild(particle);

    const duration = 1800 + Math.random() * 1800;
    const drift = (Math.random() - 0.5) * 250;

    particle.animate(
      [
        {
          transform: "translate(0, 0) rotate(0deg)",
          opacity: 1
        },
        {
          transform: `translate(${drift}px, 105vh) rotate(600deg)`,
          opacity: 0
        }
      ],
      {
        duration,
        easing: "ease-in",
        fill: "forwards"
      }
    );

    setTimeout(() => particle.remove(), duration + 100);
  }
}
