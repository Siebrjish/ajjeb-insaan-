
const gameArea = document.getElementById("gameArea");
const cake = document.getElementById("cake");
const spoon = document.getElementById("spoon");
const gameStatus = document.getElementById("gameStatus");

const partyButton = document.getElementById("partyButton");
const partyMessage = document.getElementById("partyMessage");

const RADIUS = 27.5;
const SPEED = 150;
const TURN_SPEED = 2.8;
const SAFE_DISTANCE = 145;

let width = 0;
let height = 0;

let cakeX = 150;
let cakeY = 150;

let spoonX = 300;
let spoonY = 200;

let angle = Math.random() * Math.PI * 2;
let targetAngle = angle;

let lastTime = 0;
let statusTimer = 0;
let animationStarted = false;
let partyClicked = false;

const messages = [
    "Protect the cake!",
    "Boundary detected. Turn back!",
    "The cake is safe. For now.",
    "STOP APPROACHING THE WALL.",
    "Someone needs to supervise this cake.",
    "Cake survival mode activated.",
    "Not another corner incident."
];

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function wrapAngle(value) {
    while (value > Math.PI) value -= Math.PI * 2;
    while (value < -Math.PI) value += Math.PI * 2;
    return value;
}

function setupGame() {
    const rect = gameArea.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    cakeX = width / 2;
    cakeY = height / 2;

    spoonX = width * 0.75;
    spoonY = height * 0.5;

    angle = Math.random() * Math.PI * 2;
    targetAngle = angle;

    draw();
}

function draw() {
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

    draw();
}

function getBoundaryForce() {
    let forceX = 0;
    let forceY = 0;

    // The closer the cake gets to a boundary,
    // the stronger the push back becomes.

    const left = cakeX;
    const right = width - cakeX;
    const top = cakeY;
    const bottom = height - cakeY;

    if (left < SAFE_DISTANCE) {
        forceX += (SAFE_DISTANCE - left) / SAFE_DISTANCE;
    }

    if (right < SAFE_DISTANCE) {
        forceX -= (SAFE_DISTANCE - right) / SAFE_DISTANCE;
    }

    if (top < SAFE_DISTANCE) {
        forceY += (SAFE_DISTANCE - top) / SAFE_DISTANCE;
    }

    if (bottom < SAFE_DISTANCE) {
        forceY -= (SAFE_DISTANCE - bottom) / SAFE_DISTANCE;
    }

    return { x: forceX, y: forceY };
}

function chooseDirection() {
    // Normal wandering direction.
    let x = Math.cos(targetAngle);
    let y = Math.sin(targetAngle);

    // Strong boundary avoidance.
    const boundary = getBoundaryForce();

    x += boundary.x * 5;
    y += boundary.y * 5;

    // Spoon is now secondary.
    const spoonDistance = distance(
        cakeX, cakeY, spoonX, spoonY
    );

    if (spoonDistance < 130) {
        const escapeAngle = Math.atan2(
            cakeY - spoonY,
            cakeX - spoonX
        );

        x += Math.cos(escapeAngle) * 0.5;
        y += Math.sin(escapeAngle) * 0.5;
    }

    return Math.atan2(y, x);
}

function moveCake(deltaTime) {
    // Occasionally change the cake's preferred direction.
    // Boundary avoidance will override unsafe directions.
    if (Math.random() < 0.008) {
        targetAngle += (Math.random() - 0.5) * 2.5;
    }

    const desiredAngle = chooseDirection();

    let difference = wrapAngle(desiredAngle - angle);

    const maxTurn = TURN_SPEED * deltaTime;

    difference = clamp(difference, -maxTurn, maxTurn);

    angle += difference;

    // Move forward.
    cakeX += Math.cos(angle) * SPEED * deltaTime;
    cakeY += Math.sin(angle) * SPEED * deltaTime;

    // Absolute safety guard: cake cannot leave the play area.
    cakeX = clamp(cakeX, RADIUS, width - RADIUS);
    cakeY = clamp(cakeY, RADIUS, height - RADIUS);

    // If it gets too close to a boundary, turn inward immediately.
    const margin = SAFE_DISTANCE;

    if (cakeX < margin) {
        targetAngle = 0;
    } else if (cakeX > width - margin) {
        targetAngle = Math.PI;
    }

    if (cakeY < margin) {
        targetAngle = Math.PI / 2;
    } else if (cakeY > height - margin) {
        targetAngle = -Math.PI / 2;
    }

    draw();
}

function updateStatus(deltaTime) {
    statusTimer -= deltaTime;

    if (statusTimer <= 0) {
        gameStatus.textContent =
            messages[Math.floor(Math.random() * messages.length)];

        statusTimer = 3.5;
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

function celebrate() {
    if (partyClicked) return;

    partyClicked = true;

    partyMessage.classList.add("show");
    partyMessage.textContent =
        "HAPPY BIRTHDAY, KOZEL! The cake survived. Barely.";

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
                { transform: "translateY(0)", opacity: 1 },
                {
                    transform: `translate(${Math.random() * 180 - 90}px, 110vh) rotate(500deg)`,
                    opacity: 0.7
                }
            ],
            {
                duration: 3000,
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
animationStarted = true;
requestAnimationFrame(gameLoop);
