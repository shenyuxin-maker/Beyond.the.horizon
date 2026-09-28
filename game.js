const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

const state = {
screen: "title",
paused: false,
tabOpen: false,
dialogueOpen: false,
death: false,

day: 1,
gameHour: 8,

player: {
x: 0,
y: 0,
hp: 100,
maxHp: 100,
speed: 180,
direction: "down",
moving: false,
gender: "male",
skinTone: 1,
eyeColor: "brown",
hairstyle: 1,
weapon: "sword",
swordDurability: 100,
bowDurability: 100,
arrows: 20
},

money: 500,

keys: {},
mouse: {
x: 0,
y: 0,
down: false
},

camera: {
x: 0,
y: 0
},

npc: {
x: 260,
y: -80,
type: "companyOwner",
name: "Company Owner"
},

building: {
x: 40,
y: -220,
width: 300,
height: 190
},

animationTime: 0,
lastTime: performance.now(),

save: null
};

const skinColors = {
1: "#f2c7a5",
2: "#d9a477",
3: "#a96f45",
4: "#70442d"
};

const eyeColors = {
brown: "#5a3824",
blue: "#4c83b8",
green: "#5d9250",
gray: "#8b8b8b"
};

function resizeCanvas() {
const dpr = Math.min(window.devicePixelRatio || 1, 2);

W = window.innerWidth;
H = window.innerHeight;

canvas.width = Math.floor(W * dpr);
canvas.height = Math.floor(H * dpr);
canvas.style.width = `${W}px`;
canvas.style.height = `${H}px`;

ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function showScreen(id) {
document.querySelectorAll(".screen").forEach(el => {
el.classList.add("hidden");
});

const target = document.getElementById(id);

if (target) {
target.classList.remove("hidden");
}
}

function hideOverlay(id) {
document.getElementById(id).classList.add("hidden");
}

function showOverlay(id) {
document.getElementById(id).classList.remove("hidden");
}

function updateHud() {
const p = state.player;

document.getElementById("hpText").textContent =
`${Math.max(0, Math.round(p.hp))} / ${p.maxHp}`;

const hpBlocks = 10;
const filled = Math.max(
0,
Math.min(hpBlocks, Math.ceil((p.hp / p.maxHp) * hpBlocks))
);

document.getElementById("hpBar").textContent =
"█".repeat(filled) + "░".repeat(hpBlocks - filled);

document.getElementById("dayHud").textContent = `DAY ${state.day}`;

const hour = Math.floor(state.gameHour);
const minutes = Math.floor((state.gameHour - hour) * 60);

document.getElementById("timeHud").textContent =
`${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

document.getElementById("weaponHud").textContent =
p.weapon.toUpperCase();

updateEquipment();
updateItems();
}

function updateEquipment() {
const p = state.player;

document.getElementById("equipmentText").innerHTML = `     <b>Sword</b><br>
    Attack: 20<br>
    Durability: ${p.swordDurability} / 100     <br><br>     <b>Bow</b><br>
    Attack: 15<br>
    Durability: ${p.bowDurability} / 100
  `;
}

function updateItems() {
const p = state.player;

document.getElementById("itemsText").innerHTML = `     Arrows: ${p.arrows}<br>
    Medicines: 0<br>
    Monster Materials: 0<br>
    Monster Corpses: 0 / 20<br>
    Money: ${state.money} G
  `;
}

function startGame() {
state.screen = "world";
state.paused = false;
state.tabOpen = false;

document.querySelectorAll(".screen").forEach(el => {
el.classList.add("hidden");
});

hideOverlay("pauseMenu");
hideOverlay("tabMenu");

document.getElementById("hud").style.display = "block";

updateHud();
}

function drawWorld() {
ctx.clearRect(0, 0, W, H);

ctx.save();

ctx.translate(
W / 2 - state.camera.x,
H / 2 - state.camera.y
);

drawGround();
drawRoad();
drawBuilding();
drawNpc();
drawPlayer();

ctx.restore();
}

function drawGround() {
const size = 2200;

ctx.fillStyle = "#6c8055";
ctx.fillRect(-size, -size, size * 2, size * 2);

for (let x = -size; x < size; x += 80) {
for (let y = -size; y < size; y += 80) {
ctx.fillStyle =
((x / 80 + y / 80) % 2 === 0)
? "rgba(255,255,255,0.025)"
: "rgba(0,0,0,0.025)";

```
  ctx.fillRect(x, y, 80, 80);
}
```

}

drawTree(-480, -320);
drawTree(-620, 140);
drawTree(560, -300);
drawTree(640, 260);
drawTree(-500, 420);
drawTree(520, 460);
}

function drawRoad() {
ctx.fillStyle = "#a99c80";
ctx.beginPath();
ctx.moveTo(-1000, -50);
ctx.lineTo(1000, -50);
ctx.lineTo(1000, 60);
ctx.lineTo(-1000, 60);
ctx.closePath();
ctx.fill();

ctx.beginPath();
ctx.moveTo(-70, -1000);
ctx.lineTo(70, -1000);
ctx.lineTo(70, 1000);
ctx.lineTo(-70, 1000);
ctx.closePath();
ctx.fill();
}

function drawTree(x, y) {
ctx.save();
ctx.translate(x, y);

ctx.fillStyle = "#62472d";
ctx.fillRect(-12, -5, 24, 70);

ctx.fillStyle = "#35573b";
ctx.beginPath();
ctx.arc(0, -30, 48, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = "#466b42";
ctx.beginPath();
ctx.arc(-28, -5, 34, 0, Math.PI * 2);
ctx.arc(28, -5, 34, 0, Math.PI * 2);
ctx.fill();

ctx.restore();
}

function drawBuilding() {
const b = state.building;

ctx.save();
ctx.translate(b.x, b.y);

// Main walls
ctx.fillStyle = "#7b6c5b";
ctx.fillRect(0, 0, b.width, b.height);

// Front wall
ctx.fillStyle = "#9a8a75";
ctx.fillRect(0, b.height * 0.55, b.width, b.height * 0.45);

// Roof
ctx.fillStyle = "#4d4540";
ctx.beginPath();
ctx.moveTo(-25, 0);
ctx.lineTo(b.width / 2, -90);
ctx.lineTo(b.width + 25, 0);
ctx.closePath();
ctx.fill();

// Door
ctx.fillStyle = "#352b25";
ctx.fillRect(b.width / 2 - 20, b.height - 65, 40, 65);

// Sign
ctx.fillStyle = "#e7dfca";
ctx.fillRect(70, 35, 160, 45);

ctx.fillStyle = "#242424";
ctx.font = "16px Arial";
ctx.textAlign = "center";
ctx.fillText("HUNTER COMPANY", 150, 63);

ctx.restore();
}

function drawNpc() {
drawCharacter(
state.npc.x,
state.npc.y,
{
gender: "male",
skinTone: 3,
eyeColor: "brown",
hairstyle: 1
},
state.animationTime * 0.5,
false
);
}

function drawPlayer() {
drawCharacter(
state.player.x,
state.player.y,
state.player,
state.animationTime,
state.player.moving
);
}

function drawCharacter(x, y, character, anim, walking) {
ctx.save();
ctx.translate(x, y);

// Slight top-down shadow
ctx.fillStyle = "rgba(0,0,0,0.25)";
ctx.beginPath();
ctx.ellipse(0, 27, 24, 9, 0, 0, Math.PI * 2);
ctx.fill();

const bob = walking ? Math.sin(anim * 10) * 2 : Math.sin(anim * 2) * 0.5;
const legSwing = walking ? Math.sin(anim * 10) * 8 : 0;

ctx.translate(0, bob);

// Legs
ctx.strokeStyle = "#292929";
ctx.lineWidth = 8;
ctx.lineCap = "round";

ctx.beginPath();
ctx.moveTo(-7, 14);
ctx.lineTo(-9 + legSwing / 2, 36);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(7, 14);
ctx.lineTo(9 - legSwing / 2, 36);
ctx.stroke();

// Body
ctx.fillStyle = "#37495b";
ctx.fillRect(-17, -18, 34, 35);

// Arms
ctx.beginPath();
ctx.moveTo(-16, -10);
ctx.lineTo(-25 - legSwing / 3, 10);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(16, -10);
ctx.lineTo(25 + legSwing / 3, 10);
ctx.stroke();

// Head
ctx.fillStyle = skinColors[character.skinTone] || skinColors[1];
ctx.beginPath();
ctx.arc(0, -38, 20, 0, Math.PI * 2);
ctx.fill();

// Hair
ctx.fillStyle =
character.gender === "female"
? "#5b3828"
: "#3c2922";

if (character.hairstyle === 1) {
ctx.beginPath();
ctx.arc(0, -48, 21, Math.PI, Math.PI * 2);
ctx.fill();
} else if (character.hairstyle === 2) {
ctx.fillRect(-21, -54, 42, 14);
ctx.fillRect(-25, -48, 8, 25);
} else {
ctx.beginPath();
ctx.arc(-12, -49, 12, 0, Math.PI * 2);
ctx.arc(12, -49, 12, 0, Math.PI * 2);
ctx.fill();
}

// Eyes
ctx.fillStyle = eyeColors[character.eyeColor] || eyeColors.brown;

ctx.beginPath();
ctx.arc(-7, -38, 3, 0, Math.PI * 2);
ctx.arc(7, -38, 3, 0, Math.PI * 2);
ctx.fill();

ctx.restore();
}

function updateCamera() {
state.camera.x += (state.player.x - state.camera.x) * 0.12;
state.camera.y += (state.player.y - state.camera.y) * 0.12;
}

function updateMovement(dt) {
const p = state.player;

let dx = 0;
let dy = 0;

if (state.keys.w) dy -= 1;
if (state.keys.s) dy += 1;
if (state.keys.a) dx -= 1;
if (state.keys.d) dx += 1;

p.moving = dx !== 0 || dy !== 0;

if (!p.moving) {
return;
}

const length = Math.hypot(dx, dy);

dx /= length;
dy /= length;

p.x += dx * p.speed * dt;
p.y += dy * p.speed * dt;

if (Math.abs(dx) > Math.abs(dy)) {
p.direction = dx > 0 ? "right" : "left";
} else {
p.direction = dy > 0 ? "down" : "up";
}
}

function updateGameTime(dt) {
if (state.screen !== "world") return;
if (state.paused || state.tabOpen || state.dialogueOpen || state.death) return;

// 1 real minute = 1 game hour.
state.gameHour += dt / 60;

if (state.gameHour >= 23) {
state.gameHour -= 15;
state.day += 1;
}

updateHud();
}

function distanceBetween(a, b) {
return Math.hypot(a.x - b.x, a.y - b.y);
}

function checkInteraction() {
const prompt = document.getElementById("interactionPrompt");

if (state.screen !== "world" || state.paused || state.tabOpen || state.dialogueOpen) {
prompt.style.display = "none";
return;
}

const d = distanceBetween(state.player, state.npc);

if (d < 90) {
prompt.textContent = "[E] Talk";
prompt.style.display = "block";
return;
}

const buildingCenter = {
x: state.building.x + state.building.width / 2,
y: state.building.y + state.building.height
};

const bd = distanceBetween(state.player, buildingCenter);

if (bd < 110) {
prompt.textContent = "[E] Enter Company";
prompt.style.display = "block";
return;
}

prompt.style.display = "none";
}

function interact() {
if (state.screen !== "world") return;
if (state.paused || state.tabOpen || state.dialogueOpen || state.death) return;

if (distanceBetween(state.player, state.npc) < 90) {
openDialogue(
"Company Owner",
"Ready to start hunting?",
[
{
text: "Yes.",
action: () => closeDialogue()
},
{
text: "Not yet.",
action: () => closeDialogue()
}
]
);
return;
}

const buildingCenter = {
x: state.building.x + state.building.width / 2,
y: state.building.y + state.building.height
};

if (distanceBetween(state.player, buildingCenter) < 110) {
openDialogue(
"Company",
"The Hunter Company is where you can sell monster corpses and repair weapons.",
[
{
text: "Understood.",
action: () => closeDialogue()
}
]
);
}
}

function openDialogue(name, text, choices = []) {
state.dialogueOpen = true;

document.getElementById("dialogueName").textContent = name;
document.getElementById("dialogueText").textContent = text;

const button = document.getElementById("dialogueContinue");

button.onclick = null;

if (choices.length <= 1) {
button.textContent = choices[0]?.text || "CONTINUE";

```
button.onclick = () => {
  if (choices[0]?.action) choices[0].action();
  else closeDialogue();
};
```

} else {
button.textContent = choices.map(choice => choice.text).join(" / ");

```
button.onclick = () => {
  choices[0].action();
};
```

}

showOverlay("dialogue");
}

function closeDialogue() {
state.dialogueOpen = false;
hideOverlay("dialogue");
}

function togglePause() {
if (state.screen !== "world" || state.death || state.tabOpen || state.dialogueOpen) {
return;
}

state.paused = !state.paused;

if (state.paused) {
showOverlay("pauseMenu");
} else {
hideOverlay("pauseMenu");
}
}

function toggleTabMenu() {
if (state.screen !== "world" || state.death || state.dialogueOpen || state.paused) {
return;
}

state.tabOpen = !state.tabOpen;

if (state.tabOpen) {
showOverlay("tabMenu");
updateHud();
} else {
hideOverlay("tabMenu");
}
}

function switchWeapon(weapon) {
if (weapon !== "sword" && weapon !== "bow") return;

state.player.weapon = weapon;
updateHud();
}

function saveGame() {
state.save = JSON.parse(JSON.stringify({
day: state.day,
gameHour: state.gameHour,
player: state.player,
money: state.money
}));

alert("Game saved.");
}

function loadGame() {
if (!state.save) {
alert("No save available.");
return;
}

const save = JSON.parse(JSON.stringify(state.save));

state.day = save.day;
state.gameHour = save.gameHour;
state.player = save.player;
state.money = save.money;

state.paused = false;
state.death = false;

hideOverlay("pauseMenu");
hideOverlay("deathScreen");

updateHud();
}

function die() {
if (state.death) return;

state.death = true;
state.player.hp = 0;
updateHud();

const deathScreen = document.getElementById("deathScreen");
deathScreen.classList.remove("hidden");

setTimeout(() => {
deathScreen.classList.add("hidden");

```
if (state.save) {
  loadGame();
} else {
  state.player.hp = state.player.maxHp;
  state.paused = false;
  state.death = false;
  updateHud();
}
```

}, 2200);
}

function attack() {
if (state.screen !== "world") return;
if (state.paused || state.tabOpen || state.dialogueOpen || state.death) return;

const p = state.player;

if (p.weapon === "bow" && p.arrows <= 0) {
return;
}

if (p.weapon === "bow") {
p.arrows -= 1;
p.bowDurability = Math.max(0, p.bowDurability - 1);
} else {
p.swordDurability = Math.max(0, p.swordDurability - 1);
}

updateHud();
}

function handleTitleInput() {
if (state.screen !== "title") return;

state.screen = "account";
showScreen("accountScreen");
}

function update(dt) {
if (state.screen === "world" && !state.paused && !state.tabOpen && !state.dialogueOpen && !state.death) {
updateMovement(dt);
updateCamera();
updateGameTime(dt);
}

state.animationTime += dt;

checkInteraction();
}

function render() {
if (state.screen === "world") {
drawWorld();
} else {
ctx.clearRect(0, 0, W, H);
}
}

function gameLoop(now) {
const dt = Math.min((now - state.lastTime) / 1000, 0.05);
state.lastTime = now;

update(dt);
render();

requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", event => {
const key = event.key.toLowerCase();

if (state.screen === "title") {
handleTitleInput();
return;
}

if (key === "escape") {
if (!document.getElementById("dialogue").classList.contains("hidden")) {
closeDialogue();
return;
}

```
if (state.tabOpen) {
  toggleTabMenu();
  return;
}

togglePause();
return;
```

}

if (state.screen !== "world") return;

if (key === "tab") {
event.preventDefault();
toggleTabMenu();
return;
}

state.keys[key] = true;

if (key === "e") {
interact();
}

if (key === "1") {
switchWeapon("sword");
}

if (key === "2") {
switchWeapon("bow");
}

if (key === " ") {
event.preventDefault();
}
});

document.addEventListener("keyup", event => {
state.keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", event => {
const rect = canvas.getBoundingClientRect();

state.mouse.x = event.clientX - rect.left;
state.mouse.y = event.clientY - rect.top;
});

canvas.addEventListener("mousedown", event => {
if (event.button === 0) {
state.mouse.down = true;
attack();
}
});

canvas.addEventListener("mouseup", event => {
if (event.button === 0) {
state.mouse.down = false;
}
});

document.getElementById("loginTab").addEventListener("click", () => {
document.getElementById("loginTab").classList.add("selected");
document.getElementById("signupTab").classList.remove("selected");

document.getElementById("loginForm").classList.remove("hidden");
document.getElementById("signupForm").classList.add("hidden");
});

document.getElementById("signupTab").addEventListener("click", () => {
document.getElementById("signupTab").classList.add("selected");
document.getElementById("loginTab").classList.remove("selected");

document.getElementById("signupForm").classList.remove("hidden");
document.getElementById("loginForm").classList.add("hidden");
});

document.getElementById("loginButton").addEventListener("click", () => {
const user = document.getElementById("loginUser").value.trim();
const password = document.getElementById("loginPassword").value;

if (!user || !password) {
document.getElementById("accountMessage").textContent =
"Please enter your login information.";
return;
}

document.getElementById("accountMessage").textContent =
"Demo login successful.";

setTimeout(() => {
showScreen("mainMenu");
}, 400);
});

document.getElementById("signupButton").addEventListener("click", () => {
const username = document.getElementById("signupUsername").value.trim();
const email = document.getElementById("signupEmail").value.trim();
const password = document.getElementById("signupPassword").value;
const confirm = document.getElementById("signupConfirm").value;

if (!username || !email || !password || !confirm) {
document.getElementById("accountMessage").textContent =
"Please complete all fields.";
return;
}

if (password !== confirm) {
document.getElementById("accountMessage").textContent =
"Passwords do not match.";
return;
}

document.getElementById("accountMessage").textContent =
"Demo account created.";

setTimeout(() => {
showScreen("mainMenu");
}, 500);
});

document.getElementById("newGameButton").addEventListener("click", () => {
showScreen("characterCreation");
});

document.getElementById("continueButton").addEventListener("click", () => {
startGame();
});

document.getElementById("logoutButton").addEventListener("click", () => {
showScreen("accountScreen");
});

document.getElementById("confirmCharacter").addEventListener("click", () => {
state.player.gender = document.getElementById("gender").value;
state.player.skinTone = Number(document.getElementById("skinTone").value);
state.player.eyeColor = document.getElementById("eyeColor").value;
state.player.hairstyle = Number(document.getElementById("hairstyle").value);

state.day = 1;
state.gameHour = 8;
state.player.x = 0;
state.player.y = 0;
state.player.hp = state.player.maxHp;

startGame();
});

document.getElementById("resumeButton").addEventListener("click", () => {
togglePause();
});

document.getElementById("saveButton").addEventListener("click", () => {
saveGame();
});

document.getElementById("loadButton").addEventListener("click", () => {
loadGame();
});

document.getElementById("exitButton").addEventListener("click", () => {
state.paused = false;
hideOverlay("pauseMenu");
showScreen("mainMenu");
});

document.getElementById("dialogueContinue").addEventListener("click", closeDialogue);

document.querySelectorAll(".tab-buttons button").forEach(button => {
button.addEventListener("click", () => {
document.querySelectorAll(".tab-buttons button").forEach(b => {
b.classList.remove("selected");
});

```
button.classList.add("selected");

document.querySelectorAll(".tab-page").forEach(page => {
  page.classList.add("hidden");
});

document
  .getElementById(`${button.dataset.page}Page`)
  .classList.remove("hidden");
```

});
});

document.getElementById("forgotButton").addEventListener("click", () => {
document.getElementById("accountMessage").textContent =
"Password recovery will be connected to the account server later.";
});

document.getElementById("settingsButton").addEventListener("click", () => {
alert("Settings will be expanded during V0.1 development.");
});

document.getElementById("pauseSettingsButton").addEventListener("click", () => {
alert("Settings will be expanded during V0.1 development.");
});

document.getElementById("hud").style.display = "none";

showScreen("title");
requestAnimationFrame(gameLoop);
