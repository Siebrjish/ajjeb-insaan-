const gameArea = document.getElementById("gameArea");
const cake = document.getElementById("cake");
const spoon = document.getElementById("spoon");
const gameStatus = document.getElementById("gameStatus");

const partyButton = document.getElementById("partyButton");
const partyMessage = document.getElementById("partyMessage");

const SIZE = 55;
const RADIUS = SIZE / 2;

const CAKE_SPEED = 190;
const SPOON_REACTION_DISTANCE = 175;
const SAFE_MARGIN = 48;

let width = 0;
let height = 0;

let cakeX = 100;
let cakeY = 100;

let spoonX = 0;
let spoonY = 0;

let targetX = 200;
let targetY = 150;

let lastTime = 0;
let animationStarted = false;
let partyClicked = false;

let statusTimer = 0;

const messages = [
    "You almost got it. Almost.",
    "Nope. Not today.",
    "The cake has trust issues.",
    "Try harder, human.",
    "It knows your intentions.",
    "Kozel's cake is fighting back.",
    "This cake has places to be.",
    "Nice try. Anyway..."
];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function normalize(x, y) {
    const length = Math.hypot(x, y);

    if (length === 0) {
        return { x: 0, y: 0 };
    }

    return {
        x: x / length,
        y: y / length
    };
}

function getSafeBounds() {
    return {
        left: Math.min(SAFE_MARGIN, width / 4),
        right: Math.max(width - SAFE_MARGIN, width * 0.75),
        top: Math.min(SAFE_MARGIN, height / 4),
        bottom: Math.max(height - SAFE_MARGIN, height * 0.75)
    };
}

function chooseNewTarget() {
    const bounds = getSafeBounds();

    let newX;
    let newY;

    for (let attempt = 0; attempt < 25; attempt++) {
        newX = random(bounds.left, bounds.right);
        newY = random(bounds.top, bounds.bottom);

        const farEnoughFromCake =
            distance(newX, newY, cakeX, cakeY) > 110;

        const awayFromSpoon =
            distance(newX, newY, spoonX, spoonY) > 100;

        if (farEnoughFromCake && awayFromSpoon) {
            break;
        }
    }

    targetX = newX;
    targetY = newY;
}

function updatePositions() {
    cake.style.left = `${cakeX - RADIUS}px`;
    cake.style.top = `${cakeY - RADIUS}px`;

    spoon.style.left = `${spoonX - RADIUS}px`;
    spoon.style.top = `${spoonY - RADIUS}px`;
}

function setupGame() {
    const rect = gameArea.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    const bounds = getSafeBounds();

    cakeX = clamp(width * 0.25, bounds.left, bounds.right);
    cakeY = clamp(height * 0.5, bounds.top, bounds.bottom);

    spoonX = width * 0.75;
    spoonY = height * 0.5;

    chooseNewTarget();
    updatePositions();
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

    spoon.style.left = `${spoonX - RADIUS}px`;
    spoon.style.top = `${spoonY - RADIUS}px`;
}

function moveCake(deltaTime) {
    const bounds = getSafeBounds();

    const targetDistance = distance(
        cakeX,
        cakeY,
        targetX,
        targetY
    );

    if (targetDistance < 35) {
        chooseNewTarget();
    }

    // Direction towards the current waypoint.
    const towardTarget = normalize(
        targetX - cakeX,
        targetY - cakeY
    );

    let directionX = towardTarget.x;
    let directionY = towardTarget.y;

    // If the spoon gets close, the cake tries to escape it.
    const spoonDistance = distance(
        cakeX,
        cakeY,
        spoonX,
        spoonY
    );

    if (spoonDistance < SPOON_REACTION_DISTANCE) {
        const awayFromSpoon = normalize(
            cakeX - spoonX,
            cakeY - spoonY
        );

        const danger = 1 - spoonDistance / SPOON_REACTION_DISTANCE;

        const escapeStrength = 1.2 + danger * 2;

        directionX += awayFromSpoon.x * escapeStrength;
        directionY += awayFromSpoon.y * escapeStrength;
    }

    // Gently guide the cake away from the edges.
    const edgePush = 1.8;

    if (cakeX < bounds.left + 55) {
        directionX += edgePush;
    }

    if (cakeX > bounds.right - 55) {
        directionX -= edgePush;
    }

    if (cakeY < bounds.top + 55) {
        directionY += edgePush;
    }

    if (cakeY > bounds.bottom - 55) {
        directionY -= edgePush;
    }

    const finalDirection = normalize(directionX, directionY);

    cakeX += finalDirection.x * CAKE_SPEED * deltaTime;
    cakeY += finalDirection.y * CAKE_SPEED * deltaTime;

    // Keep the cake safely inside the play area.
    cakeX = clamp(cakeX, bounds.left, bounds.right);
    cakeY = clamp(cakeY, bounds.top, bounds.bottom);

    // If it reaches an edge, give it a new destination.
    const nearEdge =
        cakeX <= bounds.left + 8 ||
        cakeX >= bounds.right - 8 ||
        cakeY <= bounds.top + 8 ||
        cakeY >= bounds.bottom - 8;

    if (nearEdge) {
        chooseNewTarget();
    }

    updatePositions();
}

function updateStatus(deltaTime) {
    statusTimer -= deltaTime;

    if (statusTimer <= 0) {
        const message = messages[
            Math.floor(Math.random() * messages.length)
        ];

        gameStatus.textContent = message;
        statusTimer = random(3, 5);
    }
}

function gameLoop(timestamp) {
    if (!animationStarted) return;

    if (!lastTime) {
        lastTime = timestamp;
    }

    // Cap the time step so the cake doesn't jump after a lag spike.
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
    lastTime = 0;

    requestAnimationFrame(gameLoop);
}

// Confetti for the birthday button.
function celebrate() {
    if (partyClicked) return;

    partyClicked = true;

    partyMessage.classList.add("show");
    partyMessage.textContent =
        "HAPPY BIRTHDAY, KOZEL! Now stop chasing the cake and enjoy your day.";

    partyButton.textContent = "BIRTHDAY CELEBRATION ACTIVATED";

    const symbols = ["🎉", "🎊", "✨", "🎈", "🥳"];

    for (let i = 0; i < 45; i++) {
        const piece = document.createElement("span");

        piece.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];

        piece.style.position = "fixed";
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.top = "-35px";
        piece.style.fontSize = `${random(16, 28)}px`;
        piece.style.pointerEvents = "none";
        piece.style.zIndex = "9999";

        document.body.appendChild(piece);

        const duration = random(2, 4);
        const drift = random(-100, 100);

        const animation = piece.animate(
            [
                {
                    transform: "translate(0, 0) rotate(0deg)",
                    opacity: 1
                },
                {
                    transform: `translate(${drift}px, 110vh) rotate(${random(180, 700)}deg)`,
                    opacity: 0.8
                }
            ],
            {
                duration: duration * 1000,
                easing: "ease-in",
                fill: "forwards"
            }
        );

        animation.onfinish = () => piece.remove();
    }
}

// Events.
gameArea.addEventListener("pointermove", moveSpoon);
gameArea.addEventListener("pointerdown", moveSpoon);

partyButton.addEventListener("click", celebrate);

window.addEventListener("resize", () => {
    setupGame();
});

// Start everything.
setupGame();
startGame();
