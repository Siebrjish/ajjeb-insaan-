
const gameArea = document.getElementById("gameArea");
const cake = document.getElementById("cake");
const spoon = document.getElementById("spoon");
const gameStatus = document.getElementById("gameStatus");

const partyButton = document.getElementById("partyButton");
const partyMessage = document.getElementById("partyMessage");

const SIZE = 55;
const RADIUS = SIZE / 2;

const SPEED = 230;
const TURN_RATE = 3.5;
const WALL_BUFFER = 100;
const SPOON_DANGER = 190;

let width = 0;
let height = 0;

let cakeX = 100;
let cakeY = 100;

let spoonX = 300;
let spoonY = 200;

let directionX = 1;
let directionY = 0;

let lastTime = 0;
let animationStarted = false;
let partyClicked = false;
let statusTimer = 0;

const messages = [
    "Not today, Kozel.",
    "You thought you could catch me?",
    "This cake has places to be.",
    "Too slow!",
    "I am literally running for my life.",
    "Nice try. Keep chasing.",
    "Catch me if you can.",
    "The cake refuses to cooperate."
];

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalize(x, y) {
    const length = Math.hypot(x, y);

    if (length < 0.0001) {
        return { x: 1, y: 0 };
    }

    return {
        x: x / length,
        y: y / length
    };
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function setupGame() {
    const rect = gameArea.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    cakeX = clamp(width * 0.25, RADIUS, width - RADIUS);
    cakeY = clamp(height * 0.5, RADIUS, height - RADIUS);

    spoonX = width * 0.75;
    spoonY = height * 0.5;

    updatePositions();
}

function updatePositions() {
    cake.style.left = `${cakeX - RADIUS}px`;
    cake.style.top = `${cakeY - RADIUS}px`;

    spoon.style.left = `${spoonX - RADIUS}px`;
    spoon.style.top = `${spoonY - RADIUS}px`;
}

function moveSpoon(event) {
    const rect = gameArea.getBoundingClientRect();

    spoonX = clamp(
        event.clientX - rect.left,
        RADIUS,
        width - RADIUS
    );

    spoonY = clamp(
        event.clientY - rect.top,
        RADIUS,
        height - RADIUS
    );

    updatePositions();
}

function getDesiredDirection() {
    // The cake's normal wandering direction.
    let x = directionX * 0.55 + Math.cos(Date.now() / 1100) * 0.35;
    let y = directionY * 0.55 + Math.sin(Date.now() / 1300) * 0.35;

    // Escape from the spoon.
    const spoonDistance = distance(
        cakeX, cakeY, spoonX, spoonY
    );

    if (spoonDistance < SPOON_DANGER) {
        const escape = normalize(
            cakeX - spoonX,
            cakeY - spoonY
        );

        const strength = 1.5 + (1 - spoonDistance / SPOON_DANGER) * 2.5;

        x += escape.x * strength;
        y += escape.y * strength;
    }

    // Smoothly turn away from all four boundaries.
    if (cakeX < WALL_BUFFER) {
        x += (WALL_BUFFER - cakeX) / WALL_BUFFER * 2.5;
    }

    if (cakeX > width - WALL_BUFFER) {
        x -= (cakeX - (width - WALL_BUFFER)) / WALL_BUFFER * 2.5;
    }

    if (cakeY < WALL_BUFFER) {
        y += (WALL_BUFFER - cakeY) / WALL_BUFFER * 2.5;
    }

    if (cakeY > height - WALL_BUFFER) {
        y -= (cakeY - (height - WALL_BUFFER)) / WALL_BUFFER * 2.5;
    }

    return normalize(x, y);
}

function moveCake(deltaTime) {
    const desired = getDesiredDirection();

    // Smoothly rotate towards the desired direction.
    const blend = Math.min(1, TURN_RATE * deltaTime);

    directionX += (desired.x - directionX) * blend;
    directionY += (desired.y - directionY) * blend;

    const direction = normalize(directionX, directionY);

    directionX = direction.x;
    directionY = direction.y;

    cakeX += directionX * SPEED * deltaTime;
    cakeY += directionY * SPEED * deltaTime;

    // Emergency correction only. The steering should turn it
    // around before it reaches these limits.
    if (cakeX < RADIUS) {
        cakeX = RADIUS;
        directionX = Math.abs(directionX);
    }

    if (cakeX > width - RADIUS) {
        cakeX = width - RADIUS;
        directionX = -Math.abs(directionX);
    }

    if (cakeY < RADIUS) {
        cakeY = RADIUS;
        directionY = Math.abs(directionY);
    }

    if (cakeY > height - RADIUS) {
        cakeY = height - RADIUS;
        directionY = -Math.abs(directionY);
    }

    updatePositions();
}

function updateStatus(deltaTime) {
    statusTimer -= deltaTime;

    if (statusTimer <= 0) {
        gameStatus.textContent =
            messages[Math.floor(Math.random() * messages.length)];

        statusTimer = 4;
    }
}

function gameLoop(timestamp) {
    if (!animationStarted) return;

    if (!lastTime) lastTime = timestamp;

    const deltaTime = Math.min(
        (timestamp - lastTime) / 1000,
        0.03
    );

    lastTime = timestamp;

    moveCake(deltaTime);
    updateStatus(deltaTime);

    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (animationStarted) return;

    animationStarted = true;
    requestAnimationFrame(gameLoop);
}

function celebrate() {
    if (partyClicked) return;

    partyClicked = true;

    partyMessage.classList.add("show");
    partyMessage.textContent =
        "HAPPY BIRTHDAY, KOZEL! Now enjoy your day. You earned it.";

    partyButton.textContent = "BIRTHDAY CELEBRATION ACTIVATED";

    const symbols = ["🎉", "🎊", "✨", "🎈", "🥳"];

    for (let i = 0; i < 45; i++) {
        const piece = document.createElement("span");

        piece.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];

        piece.style.position = "fixed";
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.top = "-35px";
        piece.style.fontSize = `${16 + Math.random() * 12}px`;
        piece.style.pointerEvents = "none";
        piece.style.zIndex = "9999";

        document.body.appendChild(piece);

        const animation = piece.animate(
            [
                { transform: "translateY(0) rotate(0deg)", opacity: 1 },
                {
                    transform: `translate(${Math.random() * 180 - 90}px, 110vh) rotate(500deg)`,
                    opacity: 0.7
                }
            ],
            {
                duration: 2500 + Math.random() * 1500,
                easing: "ease-in",
                fill: "forwards"
            }
        );

        animation.onfinish = () => piece.remove();
    }
}

gameArea.addEventListener("pointermove", moveSpoon);
gameArea.addEventListener("pointerdown", moveSpoon);

partyButton.addEventListener("click", celebrate);

window.addEventListener("resize", setupGame);

setupGame();
startGame();
