
const gameArea = document.getElementById("gameArea");
const cake = document.getElementById("cake");
const spoon = document.getElementById("spoon");
const gameStatus = document.getElementById("gameStatus");

const partyButton = document.getElementById("partyButton");
const partyMessage = document.getElementById("partyMessage");

let pointerX = 70;
let pointerY = 90;

let cakeX = 0;
let cakeY = 0;

let cakeVX = 1.8;
let cakeVY = 1.4;

let lastTaunt = 0;

function setupGame() {
  cakeX = gameArea.clientWidth * 0.65;
  cakeY = gameArea.clientHeight * 0.4;

  pointerX = gameArea.clientWidth * 0.15;
  pointerY = gameArea.clientHeight * 0.4;

  drawPositions();
}

function drawPositions() {
  cake.style.left = `${cakeX}px`;
  cake.style.top = `${cakeY}px`;

  spoon.style.left = `${pointerX - 27}px`;
  spoon.style.top = `${pointerY - 27}px`;
}

function moveSpoon(event) {
  const rect = gameArea.getBoundingClientRect();

  pointerX = event.clientX - rect.left;
  pointerY = event.clientY - rect.top;

  pointerX = Math.max(27, Math.min(gameArea.clientWidth - 27, pointerX));
  pointerY = Math.max(27, Math.min(gameArea.clientHeight - 27, pointerY));

  drawPositions();
}

gameArea.addEventListener("pointermove", moveSpoon);

gameArea.addEventListener("pointerdown", (event) => {
  moveSpoon(event);
});

function updateCake() {
  const width = gameArea.clientWidth;
  const height = gameArea.clientHeight;

  const dx = cakeX - pointerX;
  const dy = cakeY - pointerY;

  const distance = Math.sqrt(dx * dx + dy * dy) || 1;

  // The cake tries to escape the spoon.
  const escapeX = dx / distance;
  const escapeY = dy / distance;

  cakeVX = cakeVX * 0.92 + escapeX * 2.1;
  cakeVY = cakeVY * 0.92 + escapeY * 2.1;

  const speed = Math.sqrt(cakeVX * cakeVX + cakeVY * cakeVY);
  const maxSpeed = 5.2;

  if (speed > maxSpeed) {
    cakeVX = (cakeVX / speed) * maxSpeed;
    cakeVY = (cakeVY / speed) * maxSpeed;
  }

  cakeX += cakeVX;
  cakeY += cakeVY;

  // Bounce off the game area's boundaries.
  if (cakeX < 0) {
    cakeX = 0;
    cakeVX = Math.abs(cakeVX);
  }

  if (cakeX > width - 55) {
    cakeX = width - 55;
    cakeVX = -Math.abs(cakeVX);
  }

  if (cakeY < 0) {
    cakeY = 0;
    cakeVY = Math.abs(cakeVY);
  }

  if (cakeY > height - 55) {
    cakeY = height - 55;
    cakeVY = -Math.abs(cakeVY);
  }

  drawPositions();

  // Distance-based taunts.
  if (distance < 65 && Date.now() - lastTaunt > 1800) {
    const messages = [
      "Too slow.",
      "Nice attempt.",
      "The cake has other plans.",
      "Skill issue.",
      "Not today, Kozel.",
      "You almost had it. Almost."
    ];

    gameStatus.textContent =
      messages[Math.floor(Math.random() * messages.length)];

    lastTaunt = Date.now();
  }
}

function gameLoop() {
  updateCake();
  requestAnimationFrame(gameLoop);
}

setupGame();
gameLoop();

window.addEventListener("resize", setupGame);

// Birthday surprise button.
partyButton.addEventListener("click", () => {
  partyMessage.classList.remove("hidden");
  partyButton.textContent = "Happy birthday, Kozel!";
  partyButton.disabled = true;

  createConfetti();
});

// Simple confetti effect.
function createConfetti() {
  const symbols = ["✳", "✦", "·", "✧", "✺"];

  for (let i = 0; i < 45; i++) {
    const particle = document.createElement("span");

    particle.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    particle.style.position = "fixed";
    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = "-20px";
    particle.style.zIndex = "99";
    particle.style.pointerEvents = "none";
    particle.style.color = ["#d5c69b", "#a6b596", "#e9e4d6"][
      Math.floor(Math.random() * 3)
    ];
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
        duration: duration,
        easing: "ease-in",
        fill: "forwards"
      }
    );

    setTimeout(() => particle.remove(), duration + 100);
  }
}
