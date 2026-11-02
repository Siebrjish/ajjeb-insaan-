
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
let respawning = false;

const MAX_SPEED = 5;
const ACCELERATION = 0.09;

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
    width: Math.max(SIZE, gameArea.clientWidth),
    height: Math.max(SIZE, gameArea.clientHeight)
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomPosition() {
  const bounds = getBounds();

  // Spawn away from the spoon so the new cake gets a fair escape.
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = RADIUS + Math.random() * (bounds.width - SIZE);
    const y = RADIUS + Math.random() * (bounds.height - SIZE);

    if (Math.hypot(x - spoonX, y - spoonY) > 110) {
      return { x, y };
    }
  }

  return {
    x: RADIUS + Math.random() * (bounds.width - SIZE),
    y: RADIUS + Math.random() * (bounds.height - SIZE)
  };
}

function spawnCake() {
  const position = randomPosition();

  cakeX = position.x;
  cakeY = position.y;

  const angle = Math.random() * Math.PI * 2;

  velocityX = Math.cos(angle) * MAX_SPEED;
  velocityY = Math.sin(angle) * MAX_SPEED;

  cake.style.opacity = "1";
  cake.style.transform = "scale(1)";

  drawPositions();
}

function setupGame() {
  const bounds = getBounds();

  spoonX = bounds.width * 0.15;
  spoonY = bounds.height * 0.4;

  spawnCake();
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

function randomTaunt() {
  gameStatus.textContent =
    taunts[Math.floor(Math.random() * taunts.length)];
}

function respawnCake() {
  if (respawning) return;

  respawning = true;

  cake.style.opacity = "0";
  cake.style.transform = "scale(0.2) rotate(180deg)";

  gameStatus.textContent = "May be you're seeing things...";

  setTimeout(() => {
    spawnCake();

    gameStatus.textContent = "Haha. Thought you caught it?";
    respawning = false;
  }, 450);
}

function updateCake() {
  if (respawning) return;

  const bounds = getBounds();

  const dx = cakeX - spoonX;
  const dy = cakeY - spoonY;

  const distance = Math.hypot(dx, dy) || 1;

  // Escape from the spoon.
  let directionX = dx / distance;
  let directionY = dy / distance;

  // Slight steering towards the centre.
  const centreX = bounds.width / 2;
  const centreY = bounds.height / 2;

  const centreDirectionX = centreX - cakeX;
  const centreDirectionY = centreY - cakeY;

  const centreDistance =
    Math.hypot(centreDirectionX, centreDirectionY) || 1;

  directionX += (centreDirectionX / centreDistance) * 0.5;
  directionY += (centreDirectionY / centreDistance) * 0.5;

  const length = Math.hypot(directionX, directionY) || 1;

  directionX /= length;
  directionY /= length;

  velocityX +=
    (directionX * MAX_SPEED - velocityX) * ACCELERATION;

  velocityY +=
    (directionY * MAX_SPEED - velocityY) * ACCELERATION;

  cakeX += velocityX;
  cakeY += velocityY;

  // If the cake touches ANY wall or corner, it vanishes.
  const hitWall =
    cakeX <= RADIUS ||
    cakeX >= bounds.width - RADIUS ||
    cakeY <= RADIUS ||
    cakeY >= bounds.height - RADIUS;

  if (hitWall) {
    respawnCake();
    return;
  }

  // Funny messages when the spoon gets close.
  if (distance < 90 && Date.now() - lastTaunt > 2200) {
    randomTaunt();
    lastTaunt = Date.now();
  }

  drawPositions();
}

function gameLoop() {
  updateCake();
  requestAnimationFrame(gameLoop);
}

// Start game.
setupGame();
gameLoop();

// Keep everything inside the area after resizing.
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

// Confetti.
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
