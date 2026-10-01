/* =========================================================
   BEYOND THE HORIZON — V0.1
   Complete playable browser build.
   Authentication + Cloud Save: Supabase
   ========================================================= */

"use strict";

/* =========================
   SUPABASE CONFIG
   =========================
   IMPORTANT:
   Use the Publishable key only.
   NEVER put the Secret / service_role key here.
*/
const AUTH = {
  provider: "supabase",
  url: "https://xabuhtsqhlpzjnfrdbgh.supabase.co",
  anonKey: "sb_publishable_xG9O5QlpiZBq_qzJ4j9Vvw_ZyR_lyJE"
};
const $ = (id) => document.getElementById(id);
const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");

const WORLD = {
  width: 3600,
  height: 2400,

  city: {
    x: 0,
    y: 0,
    w: 1600,
    h: 1100
  },

  islands: {
    central: {
      name: "Central City",
      type: "city",
      discovered: true
    },

    forest: {
      name: "Verdant Reach",
      type: "forest",
      discovered: true
    },

    water: {
      name: "Tidefall",
      type: "water",
      discovered: false
    },

    fire: {
      name: "Ember Crown",
      type: "fire",
      discovered: false
    },

    wind: {
      name: "Skybreak",
      type: "wind",
      discovered: false
    },

    boar: {
      name: "Bramblewild",
      type: "monster",
      discovered: false
    },

    crocodile: {
      name: "Deepwater Marsh",
      type: "monster",
      discovered: false
    },

    lizard: {
      name: "Ashen Crags",
      type: "monster",
      discovered: false
    },

    eagle: {
      name: "Highwind Cliffs",
      type: "monster",
      discovered: false
    }
  }
};

const MONSTERS = {
  boar: {
    name: "Wild Boar",
    island: "boar",
    hp: 80,
    atk: 15,
    def: 5,
    speed: 110,
    radius: 20,
    corpseValue: 50,
    fee: 10,
    common: "Meat",
    rare: "Tusk"
  },

  crocodile: {
    name: "Crocodile",
    island: "crocodile",
    hp: 120,
    atk: 12,
    def: 10,
    speed: 65,
    radius: 24,
    corpseValue: 70,
    fee: 15,
    common: "Meat",
    rare: "Scale"
  },

  lizard: {
    name: "Fire Lizard",
    island: "lizard",
    hp: 150,
    atk: 8,
    def: 20,
    speed: 55,
    radius: 22,
    corpseValue: 90,
    fee: 20,
    common: "Meat",
    rare: "Fire-rock Scale"
  },

  eagle: {
    name: "Wind Eagle",
    island: "eagle",
    hp: 60,
    atk: 20,
    def: 3,
    speed: 170,
    radius: 18,
    corpseValue: 60,
    fee: 12,
    common: "Meat",
    rare: "Wind Feather"
  }
};

const MATERIAL_PRICES = {
  Meat: 12,
  Tusk: 30,
  Scale: 35,
  "Fire-rock Scale": 40,
  "Wind Feather": 35
};

const initialPlayer = () => ({
  // ===== POSITION =====
  x: 790,
  y: 540,

  // ===== HP =====
  hp: 100,
  maxHp: 100,

  // ===== ECONOMY =====
  money: 100,

  // ===== TIME =====
  day: 1,
  hour: 8,

  // ===== WEAPON =====
  weapon: "sword",

  sword: {
    power: 20,
    durability: 100,
    max: 100
  },

  bow: {
    power: 15,
    durability: 100,
    max: 100
  },

  arrows: 50,

  // ===== INVENTORY =====
  inventory: {},

  // Monster corpses carried by the player
  corpses: [],

  // Maximum corpse capacity
  maxCorpseCapacity: 20,

  // ===== WORLD LOCATION =====
  island: "central",

  discovered: [
    "central"
  ],

  // ===== CHARACTER =====
  character: {
    gender: "male",
    skin: "#f1c7a7",
    eyes: "#4b2e22",
    hair: 0
  },

  // ===== RENT =====
  rentDebt: 0,
  lastRentDay: 0,

  // ===== SAVE =====
  save: null
});

const state = {
  screen: "title",

  paused: false,
  dialogue: false,
  shop: false,
  opening: false,
  dead: false,

  keys: new Set(),

  mouse: {
  x: 0,
  y: 0,
  down: false,
  downTime: 0
},

  // ===== V0.2 WORLD =====
  world: {
    cameraX: 0,
    cameraY: 0,
    timePhase: "day"
  },

  // ===== V0.2 NPC / MONSTER =====
  npcs: [],
  monsters: [],

  // ===== V0.2 INTERACTION =====
  nearbyInteractable: null,

  lastFrame: performance.now(),

  camera: {
    x: 0,
    y: 0
  },

  player: initialPlayer(),

  particles: [],

  interaction: null,

  lastDirection: {
    x: 1,
    y: 0
  },

  // ===== COMBAT =====
  attackCooldown: 0,
  dodgeCooldown: 0,
  dodgeTimer: 0,

  dash: {
    x: 0,
    y: 0
  },

  dayAccumulator: 0,

  // ===== ACCOUNT =====
  user: null,

  session: null,

  accountReady: false,

  // ===== OPENING =====
  openingIndex: 0,

  // ===== UI =====
  toastTimer: 0,

  // ===== NPC ANIMATION =====
  npcAnim: 0
};

const OPENING = [
  [
    "The Horizon",
    "The world you know is built on floating continents. Some are peaceful. Some are wild. Beyond the safe routes lie places few ordinary people visit."
  ],

  [
    "Monsters",
    "When unusual weather and environments change, monsters can appear. Hunters make a living by tracking them, surviving their attacks, and bringing their remains back to civilization."
  ],

  [
    "A New Start",
    "At eighteen, you have received a small house in Central City and an invitation from the local monster-hunting company."
  ],

  [
    "The Invitation",
    "The company will provide you with a basic sword and bow. There is no salary. Your earnings will come from the monsters you hunt and what you choose to do with their remains."
  ],

  [
    "Beyond the Horizon",
    "The city is only the beginning. Explore, hunt, process or sell your finds, manage your money, pay your rent, and decide how far beyond the horizon you will go."
  ]
];

/* =========================
   CANVAS
   ========================= */

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);

  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

addEventListener("resize", resizeCanvas);

resizeCanvas();

/* =========================================================
   SUPABASE AUTH ADAPTER
   ========================================================= */

const AuthAdapter = {

  configured() {
    return (
      AUTH.provider === "supabase" &&
      AUTH.url.startsWith("http") &&
      AUTH.anonKey &&
      !AUTH.anonKey.includes("YOUR_")
    );
  },

  async supabase(path, options = {}) {

    if (!this.configured()) {
      throw new Error(
        "Supabase is not configured. Add your Publishable key in game.js."
      );
    }

    const headers = {
      "Content-Type": "application/json",
      "apikey": AUTH.anonKey,
      "Authorization": "Bearer " + (
        options.accessToken || AUTH.anonKey
      )
    };

    const res = await fetch(
      AUTH.url + path,
      {
        method: options.method || "GET",
        headers,
        body: options.body
          ? JSON.stringify(options.body)
          : undefined
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {

      throw new Error(
        data.msg ||
        data.error_description ||
        data.message ||
        data.error ||
        "Supabase request failed."
      );
    }

    return data;
  },

  async signUp(email, password, username) {

    const data = await this.supabase(
      "/auth/v1/signup",
      {
        method: "POST",

        body: {
          email,
          password,

          data: {
            username
          }
        }
      }
    );

    return data;
  },

  async signIn(email, password) {

    const data = await this.supabase(
      "/auth/v1/token?grant_type=password",
      {
        method: "POST",

        body: {
          email,
          password
        }
      }
    );

    return data;
  },

  async reset(email) {

    const redirectUrl =
      window.location.origin +
      window.location.pathname;

    const data = await this.supabase(
      "/auth/v1/recover",
      {
        method: "POST",

        body: {
          email,

          redirect_to: redirectUrl
        }
      }
    );

    return data;
  }
};

/* =========================================================
   SUPABASE DATABASE ADAPTER
   ========================================================= */

const SaveAdapter = {

  async getSave(userId, accessToken) {

    const encodedId = encodeURIComponent(userId);

    const data = await AuthAdapter.supabase(
      "/rest/v1/game_saves?select=id,user_id,save_data,updated_at&user_id=eq." +
      encodedId +
      "&limit=1",
      {
        method: "GET",
        accessToken
      }
    );

    return data && data.length ? data[0] : null;
  },

  async createSave(userId, saveData, accessToken) {

    const data = await AuthAdapter.supabase(
      "/rest/v1/game_saves",
      {
        method: "POST",

        accessToken,

        body: {
          user_id: userId,
          save_data: saveData
        }
      }
    );

    return data;
  },

  async updateSave(rowId, saveData, accessToken) {

    const encodedId = encodeURIComponent(rowId);

    const data = await AuthAdapter.supabase(
      "/rest/v1/game_saves?id=eq." + encodedId,
      {
        method: "PATCH",

        accessToken,

        body: {
          save_data: saveData,
          updated_at: new Date().toISOString()
        }
      }
    );

    return data;
  }
};

/* =========================================================
   UI
   ========================================================= */

function show(id) {
  const el = $(id);
  if (el) el.classList.remove("hidden");
}

function hide(id) {
  const el = $(id);
  if (el) el.classList.add("hidden");
}

function setMessage(msg) {
  const el = $("accountMessage");
  if (el) el.textContent = msg;
}

function toast(msg) {

  const el = $("toast");

  el.textContent = msg;

  el.classList.add("show");

  clearTimeout(state.toastTimer);

  state.toastTimer = setTimeout(
    () => el.classList.remove("show"),
    2200
  );
}

function setScreen(screen) {

  state.screen = screen;

  [
    "titleScreen",
    "accountScreen",
    "mainMenu",
    "characterScreen"
  ].forEach(hide);

  if (screen === "title") {
    show("titleScreen");
    hide("hud");
  }

  if (screen === "account") {
    show("accountScreen");
    hide("hud");
  }

  if (screen === "menu") {
    show("mainMenu");
    hide("hud");
  }

  if (screen === "character") {
    show("characterScreen");
    hide("hud");
  }

  if (screen === "world") {
    show("hud");
  }
}

function updateMenu() {

  $("continueButton").disabled =
    !state.player.save;

  $("welcomeText").textContent =
    state.user
      ? `Logged in as ${
          state.user.username ||
          state.user.email ||
          "Hunter"
        }`
      : "";
}

function accountTab(which) {

  document
    .querySelectorAll(".account-tabs .tab")
    .forEach(
      b => b.classList.toggle(
        "active",
        b.dataset.account === which
      )
    );

  if (which === "login") {

    show("loginForm");
    hide("signupForm");

  } else {

    hide("loginForm");
    show("signupForm");
  }

  setMessage("");
}

document
  .querySelectorAll(".account-tabs .tab")
  .forEach(
    b => b.addEventListener(
      "click",
      () => accountTab(b.dataset.account)
    )
  );

$("backToTitle").addEventListener(
  "click",
  () => setScreen("title")
);

/* =========================================================
   PASSWORD RESET
   ========================================================= */

$("forgotPassword").addEventListener(
  "click",
  async () => {

    const email =
      $("loginEmail").value.trim();

    if (!email) {

      setMessage(
        "Enter your email first."
      );

      return;
    }

    if (!AuthAdapter.configured()) {

      setMessage(
        "Supabase is not configured yet."
      );

      return;
    }

    try {

      setMessage(
        "Sending password reset email..."
      );

      await AuthAdapter.reset(email);

      setMessage(
        "Password reset email sent. Check your inbox."
      );

    } catch (e) {

      setMessage(e.message);
    }
  }
);

/* =========================================================
   LOGIN
   ========================================================= */

$("loginForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();

    const email =
      $("loginEmail").value.trim();

    const password =
      $("loginPassword").value;

    if (!email || !password) {

      setMessage(
        "Enter your email and password."
      );

      return;
    }

    setMessage("Logging in...");

    try {

      const data =
        await AuthAdapter.signIn(
          email,
          password
        );

      if (!data.access_token) {

        throw new Error(
          "Login succeeded but no session was returned."
        );
      }

      state.session = data;

      state.user = {
        id: data.user?.id,
        email: data.user?.email,
        username:
          data.user?.user_metadata?.username ||
          data.user?.email
      };

      state.accountReady = true;

      await loadCloudSave();

      setScreen("menu");

      updateMenu();

      setMessage("");

    } catch (err) {

      setMessage(
        err.message ||
        "Login failed."
      );
    }
  }
);

/* =========================================================
   SIGN UP
   ========================================================= */

$("signupForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();

    const username =
      $("signupUsername").value.trim();

    const email =
      $("signupEmail").value.trim();

    const password =
      $("signupPassword").value;

    const confirm =
      $("signupConfirm").value;

    if (!username) {

      setMessage(
        "Enter a username."
      );

      return;
    }

    if (!email) {

      setMessage(
        "Enter an email address."
      );

      return;
    }

    if (!password) {

      setMessage(
        "Enter a password."
      );

      return;
    }

    if (password !== confirm) {

      setMessage(
        "Passwords do not match."
      );

      return;
    }

    if (password.length < 6) {

      setMessage(
        "Password must be at least 6 characters."
      );

      return;
    }

    setMessage(
      "Creating account..."
    );

    try {

      const data =
        await AuthAdapter.signUp(
          email,
          password,
          username
        );

      /*
        Supabase may require email verification.
        If email confirmation is enabled,
        data.session will be null.
      */

      if (
        data.access_token &&
        data.user
      ) {

        state.session = data;

        state.user = {
          id: data.user.id,
          email: data.user.email,
          username:
            data.user.user_metadata?.username ||
            username
        };

        state.accountReady = true;

        state.player = initialPlayer();

        createInitialSave();

        await saveCloud();

        setScreen("menu");

        updateMenu();

        toast("Account created.");

      } else {

        setMessage(
          "Account created. Check your email to verify your account, then log in."
        );

        accountTab("login");

        $("loginEmail").value =
          email;
      }

    } catch (err) {

      setMessage(
        err.message ||
        "Sign up failed."
      );
    }
  }
);

/* =========================================================
   LOGOUT
   ========================================================= */

$("logoutButton").addEventListener(
  "click",
  () => {

    state.user = null;

    state.session = null;

    state.accountReady = false;

    state.player = initialPlayer();

    state.monsters = [];

    setScreen("account");

    accountTab("login");

    setMessage(
      "You have been logged out."
    );
  }
);

$("settingsButton").addEventListener(
  "click",
  () => alert(
    "V0.1 settings: responsive display, controls, and audio hooks are prepared. Full options can expand in a later version."
  )
);

/* =========================================================
   NEW GAME
   ========================================================= */

$("newGameButton").addEventListener(
  "click",
  () => {

    state.player =
      initialPlayer();

    setScreen("character");

    updateCharacterPreview();
  }
);

/* =========================================================
   CONTINUE
   ========================================================= */

$("continueButton").addEventListener(
  "click",
  () => {

    if (!state.player.save) {

      toast("No save exists.");

      return;
    }

    loadSaveObject(
      state.player.save
    );

    enterWorld();
  }
);

/* =========================================================
   CHARACTER CREATION
   ========================================================= */

[
  "gender",
  "skin",
  "eyes",
  "hair"
].forEach(
  id => $(id).addEventListener(
    "change",
    updateCharacterPreview
  )
);

$("confirmCharacter").addEventListener(
  "click",
  () => {

    state.player.character = {

      gender:
        $("gender").value,

      skin:
        $("skin").value,

      eyes:
        $("eyes").value,

      hair:
        Number($("hair").value)
    };

    state.player.money = 500;

    state.player.sword.durability = 100;

    state.player.bow.durability = 100;

    state.player.arrows = 50;

    createInitialSave();

    startOpening();
  }
);

$("cancelCharacter").addEventListener(
  "click",
  () => setScreen("menu")
);

function updateCharacterPreview() {

  const c = {

    gender:
      $("gender").value,

    skin:
      $("skin").value,

    eyes:
      $("eyes").value,

    hair:
      Number($("hair").value)
  };

  $("characterPreview").innerHTML = "";

  const cv =
    document.createElement("canvas");

  cv.width = 130;
  cv.height = 160;

  $("characterPreview")
    .appendChild(cv);

  drawCharacter(
    cv.getContext("2d"),
    65,
    120,
    1.5,
    c,
    0
  );
}

/* =========================================================
   OPENING
   ========================================================= */

function startOpening() {

  state.opening = true;

  state.openingIndex = 0;

  show("openingScreen");

  renderOpening();
}

function renderOpening() {

  const item =
    OPENING[state.openingIndex];

  $("openingTitle")
    .textContent = item[0];

  $("openingText")
    .textContent = item[1];

  $("openingNext")
    .textContent =
      state.openingIndex ===
      OPENING.length - 1
        ? "BEGIN DAY 1"
        : "CONTINUE";
}

$("openingNext").addEventListener(
  "click",
  () => {

    state.openingIndex++;

    if (
      state.openingIndex >=
      OPENING.length
    ) {

      hide("openingScreen");

      state.opening = false;

      enterWorld();

    } else {

      renderOpening();
    }
  }
);

$("skipOpening").addEventListener(
  "click",
  () => {

    hide("openingScreen");

    state.opening = false;

    enterWorld();
  }
);

addEventListener(
  "keydown",
  e => {

    if (
      state.screen === "title" &&
      !e.repeat
    ) {

      e.preventDefault();

      setScreen("account");
    }

    if (
      state.opening &&
      e.key === "Escape"
    ) {

      hide("openingScreen");

      state.opening = false;

      enterWorld();
    }
  }
);

/* =========================================================
   SAVE / LOAD
   ========================================================= */

function clone(o) {

  return JSON.parse(
    JSON.stringify(o)
  );
}

function saveObject() {

  const data =
    clone(state.player);

  data.save = null;

  return data;
}

function createInitialSave() {

  state.player.save =
    saveObject();

  state.player.save.day = 1;

  state.player.save.hour = 8;
}

/* =========================================================
   REAL SUPABASE CLOUD SAVE
   ========================================================= */

async function saveGame() {

  if (!state.user || !state.session) {

    toast(
      "You must be logged in to save."
    );

    return;
  }

  state.player.save =
    saveObject();

  try {

    await saveCloud();

    toast(
      "Game saved to the cloud."
    );

  } catch (e) {

    console.error(e);

    toast(
      "Cloud save failed."
    );
  }
}

async function saveCloud() {

  if (
    !state.user ||
    !state.session?.access_token
  ) {

    throw new Error(
      "No authenticated Supabase session."
    );
  }

  const saveData =
    saveObject();

  const existing =
    await SaveAdapter.getSave(
      state.user.id,
      state.session.access_token
    );

  if (existing) {

    await SaveAdapter.updateSave(
      existing.id,
      saveData,
      state.session.access_token
    );

  } else {

    await SaveAdapter.createSave(
      state.user.id,
      saveData,
      state.session.access_token
    );
  }

  state.player.save =
    clone(saveData);
}

async function loadCloudSave() {

  if (
    !state.user ||
    !state.session?.access_token
  ) {

    return;
  }

  try {

    const row =
      await SaveAdapter.getSave(
        state.user.id,
        state.session.access_token
      );

    if (row && row.save_data) {

      state.player.save =
        clone(row.save_data);

      updateMenu();

    } else {

      state.player.save = null;

      updateMenu();
    }

  } catch (e) {

    console.error(
      "Cloud save loading failed:",
      e
    );

    toast(
      "Could not load cloud save."
    );
  }
}

function loadSaveObject(data) {

  if (!data) return;

  const copy =
    clone(data);

  copy.save =
    clone(data);

  state.player =
    copy;

  state.monsters = [];
}

$("saveButton").addEventListener(
  "click",
  saveGame
);

$("loadButton").addEventListener(
  "click",
  async () => {

    if (!state.player.save) {

      toast(
        "No save exists."
      );

      return;
    }

    loadSaveObject(
      state.player.save
    );

    closePause();

    toast(
      "Save loaded."
    );
  }
);

/* =========================================================
   WORLD
   ========================================================= */

function enterWorld() {

  setScreen("world");

  hide("pauseMenu");
  hide("tabMenu");
  hide("dialogueBox");
  hide("shopOverlay");

  state.paused = false;
  state.dead = false;

  if (!state.player.save) {
    createInitialSave();
  }

  state.player.island =
    state.player.island ||
    "central";

  updateHUD();

  spawnIslandMonsters();

  toast(
    `Day ${state.player.day} — ${formatTime(state.player.hour)}`
  );
}

function formatTime(h) {

  const hour =
    Math.floor(h) % 24;

  return (
    String(hour).padStart(2, "0") +
    ":00"
  );
}

function updateHUD() {

  const p =
    state.player;

  $("hpText").textContent =
    `${Math.max(0, Math.round(p.hp))} / ${p.maxHp}`;

  $("hpFill").style.width =
    Math.max(
      0,
      Math.min(
        100,
        p.hp / p.maxHp * 100
      )
    ) + "%";

  $("dayText").textContent =
    `DAY ${p.day}`;

  $("timeText").textContent =
    formatTime(p.hour);

  $("moneyText").textContent =
    `${p.money} G`;

  $("weaponText").textContent =
    p.weapon.toUpperCase();
}

function currentArea() {

  return (
    WORLD.islands[
      state.player.island
    ] ||
    WORLD.islands.central
  );
}

function islandBounds() {

  if (
    state.player.island ===
    "central"
  ) {

    return {
      x: 0,
      y: 0,
      w: 1600,
      h: 1100
    };
  }

  return {
    x: 0,
    y: 0,
    w: 2200,
    h: 1500
  };
}

function setCamera() {

  const b =
    islandBounds();

  state.camera.x =
    Math.max(
      0,
      Math.min(
        b.w - innerWidth,
        state.player.x -
        innerWidth / 2
      )
    );

  state.camera.y =
    Math.max(
      0,
      Math.min(
        b.h - innerHeight,
        state.player.y -
        innerHeight / 2
      )
    );
}

/* =========================================================
   MAP / TRAIN
   ========================================================= */

function trainDestinations() {

  return state.player.discovered
    .filter(
      k => WORLD.islands[k]
    );
}

function useTrain() {

  const dests =
    trainDestinations();

  openShop(
    "TRAIN STATION",
    `
      <p>
        Select an explored station.
        Travel is immediate and consumes
        no game time in V0.1.
      </p>

      <div id="trainOptions"></div>
    `
  );

  const box =
    $("trainOptions");

  dests.forEach(k => {

    const b =
      document.createElement(
        "button"
      );

    b.className =
      "shop-action";

    b.textContent =
      WORLD.islands[k].name;

    b.addEventListener(
      "click",
      () => {

        state.player.island =
          k;

        state.player.x = 300;
        state.player.y = 300;

        closeShop();

        spawnIslandMonsters();

        toast(
          `Arrived at ${WORLD.islands[k].name}.`
        );
      }
    );

    box.appendChild(b);
  });
}

function revealIsland(k) {

  if (
    !state.player.discovered
      .includes(k)
  ) {

    state.player.discovered
      .push(k);
  }
}

/* =========================================================
   SHOPS
   ========================================================= */

function openShop(title, html) {

  state.shop = true;

  show("shopOverlay");

  $("shopTitle")
    .textContent = title;

  $("shopContent")
    .innerHTML = html;
}

function closeShop() {

  state.shop = false;

  hide("shopOverlay");
}

$("closeShop")
  .addEventListener(
    "click",
    closeShop
  );

function companyShop() {

  openShop(
    "MONSTER HUNTER COMPANY",
    `
      <p>
        Basic weapons are provided.
        Repair costs 1 G per durability point.
      </p>

      <div class="shop-action">
        <span>
          Repair Sword
          (${state.player.sword.durability}/100)
        </span>

        <button id="repairSword">
          REPAIR
        </button>
      </div>

      <div class="shop-action">
        <span>
          Repair Bow
          (${state.player.bow.durability}/100)
        </span>

        <button id="repairBow">
          REPAIR
        </button>
      </div>

      <h3>Sell Monster Corpses</h3>

      <div id="corpseSales"></div>
    `
  );

  $("repairSword").onclick =
    () => repairWeapon("sword");

  $("repairBow").onclick =
    () => repairWeapon("bow");

  const sales =
    $("corpseSales");

  if (!state.player.corpses.length) {

    sales.innerHTML =
      "<p class='muted'>No corpses.</p>";

  } else {

    state.player.corpses
      .forEach(
        (type, i) => {

          const m =
            MONSTERS[type];

          const row =
            document.createElement(
              "div"
            );

          row.className =
            "shop-action";

          row.innerHTML = `
            <span>
              ${m.name} —
              ${m.corpseValue} G
            </span>

            <button>
              SELL
            </button>
          `;

          row
            .querySelector("button")
            .onclick = () => {

              state.player.money +=
                m.corpseValue;

              state.player.corpses
                .splice(i, 1);

              companyShop();

              updateHUD();
            };

          sales.appendChild(row);
        }
      );
  }
}

function repairWeapon(w) {

  const item =
    state.player[w];

  const cost =
    item.max -
    item.durability;

  if (cost === 0) {

    toast(
      "Already fully repaired."
    );

    return;
  }

  if (
    state.player.money <
    cost
  ) {

    toast(
      "Not enough money."
    );

    return;
  }

  state.player.money -=
    cost;

  item.durability =
    item.max;

  companyShop();

  updateHUD();
}

function processingShop() {

  openShop(
    "MONSTER PROCESSING",
    `
      <p>
        Pay the processing fee to
        disassemble a corpse.
        Common material is guaranteed;
        rare material has a 50% chance.
      </p>

      <div id="processList"></div>
    `
  );

  const list =
    $("processList");

  if (
    !state.player.corpses.length
  ) {

    list.innerHTML =
      "<p class='muted'>No corpses.</p>";

    return;
  }

  state.player.corpses
    .forEach(
      (type, i) => {

        const m =
          MONSTERS[type];

        const row =
          document.createElement(
            "div"
          );

        row.className =
          "shop-action";

        row.innerHTML = `
          <span>
            ${m.name} —
            fee ${m.fee} G
          </span>

          <button>
            PROCESS
          </button>
        `;

        row
          .querySelector("button")
          .onclick = () => {

            if (
              state.player.money <
              m.fee
            ) {

              toast(
                "Not enough money."
              );

              return;
            }

            state.player.money -=
              m.fee;

            addItem(
              m.common,
              2 +
              Math.floor(
                Math.random() * 2
              )
            );

            if (
              Math.random() < 0.5
            ) {

              addItem(
                m.rare,
                1
              );
            }

            state.player.corpses
              .splice(i, 1);

            processingShop();

            updateHUD();

            refreshItems();

            toast(
              "Processing complete."
            );
          };

        list.appendChild(row);
      }
    );
}

function mallShop() {

  openShop(
    "MALL",
    `
      <h3>Arrows</h3>

      <div class="shop-action">
        <span>
          10 Arrows — 20 G
        </span>

        <button id="buy10">
          BUY
        </button>
      </div>

      <div class="shop-action">
        <span>
          50 Arrows — 90 G
        </span>

        <button id="buy50">
          BUY
        </button>
      </div>

      <h3>Medicine</h3>

      <div class="shop-action">
        <span>
          Healing Medicine — 50 G
        </span>

        <button id="buyMed">
          BUY
        </button>
      </div>

      <h3>Craft Medicine</h3>

      <p>
        1 Common Material +
        1 Rare Material +
        10 G →
        1 Healing Medicine
      </p>

      <div class="shop-action">
        <span>
          Craft 1
        </span>

        <button id="craftMed">
          CRAFT
        </button>
      </div>
    `
  );

  $("buy10").onclick =
    () => buyArrows(10, 20);

  $("buy50").onclick =
    () => buyArrows(50, 90);

  $("buyMed").onclick =
    buyMedicine;

  $("craftMed").onclick =
    craftMedicine;
}

function buyArrows(n, cost) {

  if (
    state.player.money <
    cost
  ) {

    toast(
      "Not enough money."
    );

    return;
  }

  state.player.money -=
    cost;

  state.player.arrows +=
    n;

  mallShop();

  updateHUD();
}

function buyMedicine() {

  if (
    state.player.money <
    50
  ) {

    toast(
      "Not enough money."
    );

    return;
  }

  state.player.money -=
    50;

  addItem(
    "Healing Medicine",
    1
  );

  mallShop();

  updateHUD();
}

function craftMedicine() {

  const common =
    Object.keys(
      state.player.inventory
    )
    .find(
      k => k === "Meat"
    );

  const rare = [
    "Tusk",
    "Scale",
    "Fire-rock Scale",
    "Wind Feather"
  ].find(
    k =>
      (state.player.inventory[k] || 0) > 0
  );

  if (
    !common ||
    !rare ||
    state.player.money < 10
  ) {

    toast(
      "Need 1 common material, 1 rare material and 10 G."
    );

    return;
  }

  state.player.inventory[common]--;

  state.player.inventory[rare]--;

  state.player.money -=
    10;

  addItem(
    "Healing Medicine",
    1
  );

  mallShop();

  updateHUD();

  refreshItems();
}

function addItem(name, n = 1) {

  state.player.inventory[name] =
    (state.player.inventory[name] || 0) +
    n;
}

function useMedicine() {

  if (
    (state.player.inventory[
      "Healing Medicine"
    ] || 0) <= 0
  ) {

    toast(
      "No healing medicine."
    );

    return;
  }

  if (
    state.player.hp >=
    state.player.maxHp
  ) {

    toast(
      "HP is already full."
    );

    return;
  }

  state.player.inventory[
    "Healing Medicine"
  ]--;

  state.player.hp =
    Math.min(
      state.player.maxHp,
      state.player.hp + 40
    );

  updateHUD();

  refreshItems();

  toast("+40 HP");
}

/* =========================================================
   DIALOGUE
   ========================================================= */

let dialogueAction = null;

function openDialogue(
  name,
  text,
  choices = null,
  onClose = null
) {

  state.dialogue = true;

  show("dialogueBox");

  $("dialogueName")
    .textContent = name;

  $("dialogueText")
    .textContent = text;

  const c =
    $("dialogueChoices");

  c.innerHTML = "";

  dialogueAction =
    onClose;

  $("dialogueContinue")
    .classList.toggle(
      "hidden",
      !!choices
    );

  if (choices) {

    choices.forEach(
      ch => {

        const b =
          document.createElement(
            "button"
          );

        b.textContent =
          ch.label;

        b.onclick = () => {

          if (ch.action) {
            ch.action();
          }

          closeDialogue();
        };

        c.appendChild(b);
      }
    );
  }
}

function closeDialogue() {

  state.dialogue = false;

  hide("dialogueBox");

  $("dialogueChoices")
    .innerHTML = "";

  if (dialogueAction) {

    const a =
      dialogueAction;

    dialogueAction = null;

    a();
  }
}

$("dialogueContinue")
  .addEventListener(
    "click",
    closeDialogue
  );

/* =========================================================
   INTERACTIONS
   ========================================================= */

const INTERACTABLES = [

  {
    name: "Hunter Company",
    x: 800,
    y: 160,
    w: 360,
    h: 220,
    action: companyShop,
    prompt: "[E] Enter Hunter Company"
  },

  {
    name: "Processing Shop",
    x: 420,
    y: 700,
    w: 300,
    h: 190,
    action: processingShop,
    prompt: "[E] Enter Processing Shop"
  },

  {
    name: "Mall",
    x: 1110,
    y: 680,
    w: 360,
    h: 230,
    action: mallShop,
    prompt: "[E] Enter Mall"
  },

  {
    name: "Train Station",
    x: 1420,
    y: 430,
    w: 120,
    h: 120,
    action: useTrain,
    prompt: "[E] Use Train Station"
  },

  {
    name: "House",
    x: 80,
    y: 430,
    w: 260,
    h: 240,
    action: () => houseMenu(),
    prompt: "[E] Enter House"
  }
];

function houseMenu() {

  openShop(
    "YOUR HOUSE",
    `
      <p>
        Your home.
        Sleeping advances to the next day
        and restores HP.
      </p>

      <div class="shop-action">
        <span>Bed</span>
        <button id="sleepBtn">
          SLEEP
        </button>
      </div>

      <div class="shop-action">
        <span>Manual Save</span>
        <button id="houseSave">
          SAVE
        </button>
      </div>
    `
  );

  $("sleepBtn").onclick = () => {

    closeShop();

    sleep();
  };

  $("houseSave").onclick =
    () => saveGame();
}

function checkInteraction() {

  state.interaction = null;

  if (
    state.player.island !==
    "central"
  ) {

    const train = {
      x: 80,
      y: 80,
      w: 150,
      h: 120
    };

    if (
      inRect(
        state.player,
        train
      )
    ) {

      state.interaction = {
        prompt: "[E] Use Train Station",
        action: useTrain
      };

      return;
    }

    return;
  }

  for (
    const obj of INTERACTABLES
  ) {

    if (
      inRect(
        state.player,
        {
          x: obj.x - 35,
          y: obj.y - 35,
          w: obj.w + 70,
          h: obj.h + 70
        }
      )
    ) {

      state.interaction = {
        prompt: obj.prompt,
        action: obj.action
      };

      return;
    }
  }
}

function inRect(p, r) {

  return (
    p.x >= r.x &&
    p.x <= r.x + r.w &&
    p.y >= r.y &&
    p.y <= r.y + r.h
  );
}

/* =========================================================
   INPUT
   ========================================================= */

addEventListener(
  "keydown",
  e => {

    const k =
      e.key.toLowerCase();


    // ===== TAB =====

    if (e.key === "Tab") {

      e.preventDefault();

      if (
        state.screen === "world" &&
        !state.opening &&
        !state.dead &&
        !state.dialogue &&
        !state.shop
      ) {

        toggleTab();
      }

      return;
    }


    // ===== ESC =====

    if (e.key === "Escape") {

      if (
        !["world"].includes(
          state.screen
        )
      ) {

        return;
      }

      if (state.dialogue) {

        closeDialogue();

        return;
      }

      if (state.shop) {

        closeShop();

        return;
      }

      if (!state.opening) {

        togglePause();
      }

      return;
    }


    // ===== WORLD ONLY =====

    if (
      state.screen !== "world" ||
      state.opening ||
      state.dialogue ||
      state.shop ||
      state.dead
    ) {

      return;
    }


    // ===== WEAPON SWITCH =====

    if (
      ["1", "2"].includes(
        e.key
      )
    ) {

      equip(
        e.key === "1"
          ? "sword"
          : "bow"
      );

      return;
    }


    // ===== INTERACT =====

    if (k === "e") {

      if (
        state.interaction
      ) {

        state.interaction
          .action();
      }

      return;
    }


    // ===== MEDICINE =====

    if (k === "q") {

      useMedicine();

      return;
    }


    // ===== MOVEMENT KEYS =====

    if (
      ["w", "a", "s", "d"].includes(k)
    ) {

      /*
        Double tap:
        WW / AA / SS / DD = Dodge

        A repeated key event is ignored so
        holding the key does not trigger dodge.
      */

      if (!e.repeat) {

        const now =
          performance.now();

        if (
          now - lastTap[k] <
          280
        ) {

          startDodge(k);
        }

        lastTap[k] =
          now;
      }

      state.keys.add(k);

      return;
    }


    // ===== SHIFT RUN =====

    if (k === "shift") {

      state.keys.add("shift");

      return;
    }
  }
);


addEventListener(
  "keyup",
  e => {

    const k =
      e.key.toLowerCase();

    state.keys.delete(k);
  }
);


// =========================================================
// MOUSE
// =========================================================

canvas.addEventListener(
  "mousemove",
  e => {

    const r =
      canvas.getBoundingClientRect();

    state.mouse.x =
      e.clientX - r.left;

    state.mouse.y =
      e.clientY - r.top;
  }
);


canvas.addEventListener(
  "mousedown",
  e => {

    if (
      e.button === 0
    ) {

      state.mouse.down = true;

      state.mouse.downTime =
        0;
    }
  }
);

addEventListener(
  "mouseup",
  e => {

    if (
      e.button === 0 &&
      state.mouse.down
    ) {

      const chargeTime =
        state.mouse.downTime;

      state.mouse.down = false;

      state.mouse.downTime =
        0;

      playerAttack(
        chargeTime
      );
    }
  }
);


// =========================================================
// DOUBLE-TAP DODGE
// =========================================================

let lastTap = {
  w: 0,
  a: 0,
  s: 0,
  d: 0
};


function equip(w) {

  if (
    w === "bow" &&
    state.player.arrows <= 0
  ) {

    toast(
      "No arrows."
    );

    return;
  }

  state.player.weapon =
    w;

  updateHUD();
}


function startDodge(k) {

  if (
    state.dodgeCooldown > 0 ||
    state.dodgeTimer > 0
  ) {

    return;
  }


  const d = {
    w: [0, -1],
    a: [-1, 0],
    s: [0, 1],
    d: [1, 0]
  }[k];


  if (!d) {

    return;
  }


  state.dash = {
    x: d[0],
    y: d[1]
  };


  // Dodge duration

  state.dodgeTimer =
    0.16;


  // Dodge cooldown

  state.dodgeCooldown =
    1;
}

/* =========================================================
   PAUSE / TAB
   ========================================================= */

function togglePause() {

  state.paused =
    !state.paused;

  if (state.paused) {

    show("pauseMenu");

  } else {

    hide("pauseMenu");
  }
}

function closePause() {

  state.paused = false;

  hide("pauseMenu");
}

$("resumeButton")
  .addEventListener(
    "click",
    closePause
  );

$("exitButton")
  .addEventListener(
    "click",
    async () => {

      closePause();

      await saveGame();

      setScreen("menu");

      hide("hud");

      updateMenu();
    }
  );

$("pauseSettingsButton")
  .addEventListener(
    "click",
    () =>
      alert(
        "Settings are paused here in V0.1 and can be expanded without changing the save system."
      )
  );

function toggleTab() {

  state.paused = true;

  show("tabMenu");

  refreshItems();

  refreshEquipment();

  refreshMap();
}

$("closeTab")
  .addEventListener(
    "click",
    () => {

      state.paused = false;

      hide("tabMenu");
    }
  );

document
  .querySelectorAll(
    ".tab-buttons button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".tab-buttons button"
            )
            .forEach(
              b =>
                b.classList.remove(
                  "selected"
                )
            );

          button.classList.add(
            "selected"
          );

          document
            .querySelectorAll(
              ".tab-page"
            )
            .forEach(
              page =>
                page.classList.add(
                  "hidden"
                )
            );

          $(
            button.dataset.page +
            "Page"
          ).classList.remove(
            "hidden"
          );

          if (
            button.dataset.page ===
            "items"
          ) {

            refreshItems();
          }

          if (
            button.dataset.page ===
            "equipment"
          ) {

            refreshEquipment();
          }

          if (
            button.dataset.page ===
            "map"
          ) {

            refreshMap();
          }
        }
      );
    }
  );

$("equipSword")
  .addEventListener(
    "click",
    () => equip("sword")
  );

$("equipBow")
  .addEventListener(
    "click",
    () => equip("bow")
  );

function refreshEquipment() {

  const p =
    state.player;

  $("equipInfo").innerHTML =

    `Sword: ${p.sword.power} ATK — ${p.sword.durability}/100 durability<br>` +

    `Bow: ${p.bow.power} ATK — ${p.bow.durability}/100 durability<br>` +

    `Arrows: ${p.arrows}<br>` +

    `Current: ${p.weapon.toUpperCase()}`;
}

function refreshItems() {

  const list =
    $("itemsList");

  list.innerHTML = "";

  const entries =
    Object.entries(
      state.player.inventory
    )
    .filter(
      ([, n]) => n > 0
    );

  if (!entries.length) {

    list.innerHTML =
      "<p class='muted'>No items.</p>";
  }

  entries.forEach(
    ([n, v]) => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "shop-action";

      row.innerHTML =
        `<span>${n} × ${v}</span>`;

      if (
        n ===
        "Healing Medicine"
      ) {

        const b =
          document.createElement(
            "button"
          );

        b.textContent =
          "USE";

        b.onclick =
          useMedicine;

        row.appendChild(b);
      }

      list.appendChild(row);
    }
  );

  $("corpseCount")
    .textContent =
    state.player.corpses.length;
}

function refreshMap() {

  const list =
    $("mapList");

  list.innerHTML = "";

  state.player.discovered
    .forEach(
      k => {

        const row =
          document.createElement(
            "div"
          );

        row.className =
          "map-row";

        row.textContent =
          (
            k ===
            state.player.island
              ? "▲ "
              : ""
          ) +
          WORLD.islands[k].name +
          " — TRAIN STATION";

        list.appendChild(row);
      }
    );
}

/* =========================================================
   TIME / RENT
   ========================================================= */

function advanceTime(hours = 1) {

  state.player.hour +=
    hours;

  while (
    state.player.hour >=
    24
  ) {

    state.player.hour -=
      24;

    state.player.day++;

    if (
      state.player.day -
      state.player.lastRentDay >=
      30
    ) {

      processRent();
    }
  }

  updateHUD();
}

function processRent() {

  state.player.lastRentDay =
    state.player.day;

  const rent = 500;

  if (
    state.player.money >=
    rent
  ) {

    state.player.money -=
      rent;

    toast(
      "Monthly rent paid: 500 G."
    );

  } else {

    state.player.rentDebt +=
      rent -
      state.player.money;

    state.player.money = 0;

    toast(
      `Rent unpaid. Debt: ${state.player.rentDebt} G.`
    );
  }
}

function sleep() {

  state.player.hp =
    state.player.maxHp;

  advanceTime(
    24 -
    state.player.hour
  );

  state.player.hour = 8;

  updateHUD();

  saveGame();

  toast(
    `Good morning. Day ${state.player.day}.`
  );
}

/* =========================================================
   MONSTERS
   ========================================================= */

function spawnIslandMonsters() {

  state.monsters = [];

  const typeMap = {

    boar: "boar",

    crocodile: "crocodile",

    lizard: "lizard",

    eagle: "eagle"
  };

  const type =
    typeMap[
      state.player.island
    ];

  if (!type) return;

  for (
    let i = 0;
    i < 4;
    i++
  ) {

    const m =
      MONSTERS[type];

    state.monsters.push({

      type,

      x:
        650 +
        (i % 2) * 230 +
        Math.random() * 70,

      y:
        420 +
        Math.floor(i / 2) *
          220 +
        Math.random() * 60,

      hp: m.hp,

      maxHp: m.hp,

      state: "idle",

      attackTimer:
        1 +
        Math.random(),

      telegraph: 0,

      wander:
        Math.random() * 6
    });
  }
}

function updateMonsters(dt) {

  for (
    const e of state.monsters
  ) {

    const m =
      MONSTERS[e.type];

    const dx =
      state.player.x -
      e.x;

    const dy =
      state.player.y -
      e.y;

    const dist =
      Math.hypot(
        dx,
        dy
      );

    e.wander +=
      dt;

    if (dist < 420) {

      if (
        e.telegraph > 0
      ) {

        e.telegraph -=
          dt;

        if (
          e.telegraph <= 0
        ) {

          monsterHit(
            e,
            m
          );

          e.attackTimer =
            1.2;
        }

      } else if (
        e.attackTimer > 0
      ) {

        e.attackTimer -=
          dt;

      } else if (
        dist <
        m.radius + 36
      ) {

        e.telegraph =
          .55;

      } else {

        e.x +=
          dx / dist *
          m.speed *
          dt *
          .65;

        e.y +=
          dy / dist *
          m.speed *
          dt *
          .65;
      }

    } else {

      e.x +=
        Math.cos(
          e.wander
        ) *
        m.speed *
        .12 *
        dt;

      e.y +=
        Math.sin(
          e.wander * 1.3
        ) *
        m.speed *
        .12 *
        dt;

      e.attackTimer =
        Math.max(
          0,
          e.attackTimer - dt
        );
    }
  }
}

function monsterHit(e, m) {

  if (
    state.dodgeTimer > 0
  ) {

    return;
  }

  damagePlayer(
    m.atk
  );
}

function damagePlayer(n) {

  state.player.hp =
    Math.max(
      0,
      state.player.hp - n
    );

  updateHUD();

  if (
    state.player.hp <= 0
  ) {

    die();
  }
}

/* =========================================================
   PLAYER ATTACK
   ========================================================= */

function playerAttack(chargeTime = 0) {

  if (
    state.attackCooldown > 0
  ) {

    return;
  }


  const w =
    state.player.weapon;

  const item =
    state.player[w];


  // ===== WEAPON CHECK =====

  if (
    !item
  ) {

    return;
  }


  if (
    item.durability <= 0
  ) {

    toast(
      `${w.toUpperCase()} is broken.`
    );

    return;
  }


  // ===== BOW AMMO CHECK =====

  if (
    w === "bow" &&
    state.player.arrows <= 0
  ) {

    toast(
      "No arrows."
    );

    return;
  }


  // ===== PLAYER POSITION =====

  const px =
    state.player.x;

  const py =
    state.player.y;


  // ===== AIM AT MOUSE =====

  const ang =
    Math.atan2(

      state.mouse.y +
        state.camera.y -
        py,

      state.mouse.x +
        state.camera.x -
        px
    );


  // =========================================================
  // SWORD
  // =========================================================

  if (
    w === "sword"
  ) {

    const range =
      78;

    const damage =
      item.power;

    let hit = false;


    for (
      const e of [
        ...state.monsters
      ]
    ) {

      const dx =
        e.x - px;

      const dy =
        e.y - py;

      const dist =
        Math.hypot(
          dx,
          dy
        );


      if (
        dist > range
      ) {

        continue;
      }


      const enemyAngle =
        Math.atan2(
          dy,
          dx
        );


      const angleDifference =
        Math.abs(
          Math.atan2(
            Math.sin(
              enemyAngle - ang
            ),
            Math.cos(
              enemyAngle - ang
            )
          )
        );


      // Sword attack arc

      if (
        angleDifference >
        0.9
      ) {

        continue;
      }


      const m =
        MONSTERS[e.type];


      e.hp =
        Math.max(
          0,
          e.hp -
          Math.max(
            1,
            damage -
            m.def
          )
        );


      hit = true;


      if (
        e.hp <= 0
      ) {

        killMonster(e);
      }
    }


    // Sword durability

    item.durability =
      Math.max(
        0,
        item.durability - 1
      );


    // Sword attack cooldown

    state.attackCooldown =
      hit
        ? 0.35
        : 0.25;


    return;
  }


  // =========================================================
  // BOW
  // =========================================================

  if (
    w === "bow"
  ) {

    // Consume one arrow

    state.player.arrows--;


    const range =
      600;

    const damage =
      item.power;

    let target = null;

    let targetDist =
      Infinity;


    // Find the enemy closest
    // to the mouse aiming direction

    for (
      const e of [
        ...state.monsters
      ]
    ) {

      const dx =
        e.x - px;

      const dy =
        e.y - py;

      const dist =
        Math.hypot(
          dx,
          dy
        );


      if (
        dist > range
      ) {

        continue;
      }


      const enemyAngle =
        Math.atan2(
          dy,
          dx
        );


      const angleDifference =
        Math.abs(
          Math.atan2(
            Math.sin(
              enemyAngle - ang
            ),
            Math.cos(
              enemyAngle - ang
            )
          )
        );


      // Narrow bow aiming angle

      if (
        angleDifference >
        0.16
      ) {

        continue;
      }


      if (
        dist <
        targetDist
      ) {

        target =
          e;

        targetDist =
          dist;
      }
    }


    // Hit the first monster
    // along the arrow direction

    if (
      target
    ) {

      const m =
        MONSTERS[
          target.type
        ];


      target.hp =
        Math.max(
          0,
          target.hp -
          Math.max(
            1,
            damage -
            m.def
          )
        );


      if (
        target.hp <= 0
      ) {

        killMonster(target);
      }
    }


    // Bow durability

    item.durability =
      Math.max(
        0,
        item.durability - 1
      );


    // Bow fires slower than sword

    state.attackCooldown =
      0.45;


    updateHUD();
  }
}

function killMonster(e) {

  const i =
    state.monsters.indexOf(e);

  if (i < 0) return;

  const type =
    e.type;

  if (
    state.player.corpses
      .length >= 20
  ) {

    toast(
      "Corpse capacity full."
    );

    return;
  }

  state.player.corpses
    .push(type);

  state.monsters.splice(
    i,
    1
  );

  toast(
    `${MONSTERS[type].name} defeated. Corpse added.`
  );
}

/* =========================================================
   DEATH
   ========================================================= */

function die() {

  if (state.dead) return;

  state.dead = true;

  state.mouse.down = false;

  state.player.hp = 0;

  show("deathScreen");

  setTimeout(
    () => {

      if (
        state.player.save
      ) {

        loadSaveObject(
          state.player.save
        );

      } else {

        createInitialSave();
      }

      hide("deathScreen");

      state.dead = false;

      enterWorld();

      toast(
        "Returned to your last save."
      );

    },
    1800
  );
}

/* =========================================================
   DRAWING
   ========================================================= */

function clear() {

  ctx.clearRect(
    0,
    0,
    innerWidth,
    innerHeight
  );
}

function worldToScreen(x, y) {

  return {
    x:
      x -
      state.camera.x,

    y:
      y -
      state.camera.y
  };
}

function drawWorld() {

  const area =
    currentArea();

  ctx.fillStyle =
    area.type === "city"
      ? "#83a66d"

      : area.type === "forest"
      ? "#4f7f4d"

      : area.type === "water"
      ? "#447e99"

      : area.type === "fire"
      ? "#4a3c35"

      : area.type === "wind"
      ? "#a5b6a5"

      : "#6c7358";

  ctx.fillRect(
    0,
    0,
    innerWidth,
    innerHeight
  );

  ctx.save();

  ctx.translate(
    -state.camera.x,
    -state.camera.y
  );

  if (
    state.player.island ===
    "central"
  ) {

    drawCity();

  } else {

    drawWildIsland(
      area.type
    );
  }

  ctx.restore();
}

function drawCity() {

  ctx.fillStyle =
    "#6b6b5c";

  ctx.fillRect(
    0,
    0,
    1600,
    1100
  );

  ctx.fillStyle =
    "#a58d68";

  ctx.fillRect(
    620,
    0,
    120,
    1100
  );

  ctx.fillRect(
    0,
    470,
    1600,
    120
  );

  ctx.fillStyle =
    "#8cae72";

  for (
    let i = 0;
    i < 24;
    i++
  ) {

    const x =
      (i * 137) % 1550;

    const y =
      (i * 211) % 1050;

    if (
      x > 500 &&
      x < 1500 &&
      y > 350 &&
      y < 850
    ) {

      continue;
    }

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      18,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  building(
    800,
    160,
    360,
    220,
    "HUNTER COMPANY",
    "#725544"
  );

  building(
    420,
    700,
    300,
    190,
    "PROCESSING",
    "#496f72"
  );

  building(
    1110,
    680,
    360,
    230,
    "MALL",
    "#75624c"
  );

  building(
    80,
    430,
    260,
    240,
    "HOME",
    "#62534c"
  );

  station(
    1420,
    430
  );

  ctx.fillStyle =
    "#d5bd69";

  ctx.fillRect(
    1360,
    480,
    80,
    4
  );

  ctx.fillRect(
    1510,
    480,
    60,
    4
  );

  for (
    let i = 0;
    i < 10;
    i++
  ) {

    bench(
      350 + i * 105,
      400 + (i % 2) * 250
    );
  }
}

function building(
  x,
  y,
  w,
  h,
  label,
  roof
) {

  ctx.fillStyle =
    "#40372f";

  ctx.fillRect(
    x,
    y,
    w,
    h
  );

  ctx.fillStyle =
    roof;

  ctx.beginPath();

  ctx.moveTo(
    x - 20,
    y
  );

  ctx.lineTo(
    x + w / 2,
    y - 70
  );

  ctx.lineTo(
    x + w + 20,
    y
  );

  ctx.closePath();

  ctx.fill();

  ctx.fillStyle =
    "#e6d7b7";

  ctx.font =
    "bold 18px system-ui";

  ctx.textAlign =
    "center";

  ctx.fillText(
    label,
    x + w / 2,
    y + h / 2
  );

  ctx.fillStyle =
    "#292421";

  ctx.fillRect(
    x + w / 2 - 18,
    y + h - 55,
    36,
    55
  );
}

function station(x, y) {

  ctx.fillStyle =
    "#343b43";

  ctx.fillRect(
    x,
    y,
    120,
    120
  );

  ctx.fillStyle =
    "#c8d0d8";

  ctx.fillRect(
    x + 25,
    y + 25,
    70,
    14
  );

  ctx.fillRect(
    x + 35,
    y + 62,
    50,
    8
  );

  ctx.font =
    "12px system-ui";

  ctx.textAlign =
    "center";

  ctx.fillText(
    "TRAIN",
    x + 60,
    y + 102
  );
}

function bench(x, y) {

  ctx.fillStyle =
    "#65492e";

  ctx.fillRect(
    x,
    y,
    65,
    10
  );

  ctx.fillRect(
    x + 5,
    y + 10,
    7,
    24
  );

  ctx.fillRect(
    x + 53,
    y + 10,
    7,
    24
  );
}

function drawWildIsland(type) {

  ctx.fillStyle =
    type === "forest"
      ? "#4f7f4d"

      : type === "water"
      ? "#447e99"

      : type === "fire"
      ? "#4a3c35"

      : type === "wind"
      ? "#a5b6a5"

      : "#6c7358";

  ctx.fillRect(
    0,
    0,
    2200,
    1500
  );

  for (
    let i = 0;
    i < 45;
    i++
  ) {

    const x =
      (i * 173) % 2100;

    const y =
      (i * 97) % 1400;

    ctx.globalAlpha =
      .18;

    ctx.fillStyle =
      "#ffffff";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      25 +
        (i % 4) * 7,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function drawCharacter(
  c,
  x,
  y,
  scale,
  data,
  walk
) {

  c.save();

  c.translate(
    x,
    y
  );

  c.scale(
    scale,
    scale
  );

  const bob =
    Math.sin(
      walk * 10
    ) * 2;

  c.strokeStyle =
    "#27221e";

  c.lineWidth = 3;

  c.fillStyle =
    data.skin;

  c.beginPath();

  c.arc(
    0,
    -43 + bob,
    13,
    0,
    Math.PI * 2
  );

  c.fill();

  c.stroke();

  c.fillStyle =
    "#fff";

  c.beginPath();

  c.arc(
    -5,
    -45 + bob,
    3,
    0,
    Math.PI * 2
  );

  c.arc(
    5,
    -45 + bob,
    3,
    0,
    Math.PI * 2
  );

  c.fill();

  c.fillStyle =
    data.eyes;

  c.beginPath();

  c.arc(
    -5,
    -45 + bob,
    1.3,
    0,
    Math.PI * 2
  );

  c.arc(
    5,
    -45 + bob,
    1.3,
    0,
    Math.PI * 2
  );

  c.fill();

  c.fillStyle =
    "#392b27";

  if (
    data.hair === 0
  ) {

    c.fillRect(
      -13,
      -58 + bob,
      26,
      8
    );

  } else if (
    data.hair === 1
  ) {

    c.beginPath();

    c.arc(
      -3,
      -56 + bob,
      15,
      Math.PI,
      Math.PI * 2
    );

    c.fill();

  } else {

    c.beginPath();

    c.moveTo(
      -14,
      -56 + bob
    );

    c.lineTo(
      0,
      -67 + bob
    );

    c.lineTo(
      15,
      -56 + bob
    );

    c.lineTo(
      12,
      -48 + bob
    );

    c.lineTo(
      -12,
      -48 + bob
    );

    c.fill();
  }

  c.fillStyle =
    "#3c5066";

  c.fillRect(
    -12,
    -29 + bob,
    24,
    30
  );

  const swing =
    Math.sin(
      walk * 10
    ) * 6;

  c.strokeStyle =
    data.skin;

  c.lineWidth = 7;

  c.beginPath();

  c.moveTo(
    -10,
    -22 + bob
  );

  c.lineTo(
    -17 + swing * .2,
    3
  );

  c.moveTo(
    10,
    -22 + bob
  );

  c.lineTo(
    17 - swing * .2,
    3
  );

  c.stroke();

  c.strokeStyle =
    "#222";

  c.lineWidth = 8;

  c.beginPath();

  c.moveTo(
    -6,
    1
  );

  c.lineTo(
    -8 - swing * .15,
    30
  );

  c.moveTo(
    6,
    1
  );

  c.lineTo(
    8 + swing * .15,
    30
  );

  c.stroke();

  c.restore();
}

function drawMonster(e) {

  const s =
    worldToScreen(
      e.x,
      e.y
    );

  const m =
    MONSTERS[e.type];

  ctx.save();

  ctx.translate(
    s.x,
    s.y
  );

  if (
    e.type === "boar"
  ) {

    ctx.fillStyle =
      "#6b4b34";

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      32,
      20,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
      "#876040";

    ctx.beginPath();

    ctx.arc(
      27,
      0,
      18,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle =
      "#86b34d";

    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(
      22,
      -15
    );

    ctx.lineTo(
      32,
      -34
    );

    ctx.moveTo(
      34,
      -14
    );

    ctx.lineTo(
      45,
      -32
    );

    ctx.stroke();

    ctx.fillStyle =
      "#e9d9b5";

    ctx.beginPath();

    ctx.moveTo(
      36,
      8
    );

    ctx.lineTo(
      50,
      18
    );

    ctx.lineTo(
      34,
      17
    );

    ctx.fill();

  } else if (
    e.type === "crocodile"
  ) {

    ctx.fillStyle =
      "#3b2454";

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      40,
      18,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
      "#5c3b78";

    ctx.beginPath();

    ctx.moveTo(
      20,
      -5
    );

    ctx.lineTo(
      58,
      -12
    );

    ctx.lineTo(
      58,
      12
    );

    ctx.lineTo(
      20,
      8
    );

    ctx.fill();

    ctx.fillStyle =
      "#e5c9ff";

    ctx.fillRect(
      45,
      -10,
      5,
      4
    );

    ctx.fillRect(
      45,
      6,
      5,
      4
    );

  } else if (
    e.type === "lizard"
  ) {

    ctx.fillStyle =
      "#272727";

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      28,
      22,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle =
      "#ef542e";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
      -18,
      -13
    );

    ctx.lineTo(
      -5,
      -3
    );

    ctx.lineTo(
      8,
      -15
    );

    ctx.moveTo(
      -12,
      13
    );

    ctx.lineTo(
      2,
      4
    );

    ctx.lineTo(
      18,
      14
    );

    ctx.stroke();

  } else {

    ctx.fillStyle =
      "#dce9ed";

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      25,
      12,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle =
      "#91c6e0";

    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(
      -15,
      -3
    );

    ctx.lineTo(
      -45,
      -22
    );

    ctx.moveTo(
      10,
      -4
    );

    ctx.lineTo(
      42,
      -25
    );

    ctx.stroke();

    ctx.fillStyle =
      "#d6a33e";

    ctx.beginPath();

    ctx.moveTo(
      23,
      0
    );

    ctx.lineTo(
      45,
      5
    );

    ctx.lineTo(
      23,
      9
    );

    ctx.fill();
  }

  if (
    e.telegraph > 0
  ) {

    ctx.strokeStyle =
      "#fff0a0";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      m.radius + 10,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  ctx.fillStyle =
    "#1b1111";

  ctx.fillRect(
    -30,
    -m.radius - 18,
    60,
    5
  );

  ctx.fillStyle =
    "#d64a4a";

  ctx.fillRect(
    -30,
    -m.radius - 18,
    60 *
      Math.max(
        0,
        e.hp / m.hp
      ),
    5
  );

  ctx.restore();
}

/* =========================================================
   DRAW
   ========================================================= */

function draw() {

  clear();

  setCamera();

  drawWorld();

  if (
    state.screen ===
    "world"
  ) {

    for (
      const e of state.monsters
    ) {

      drawMonster(e);
    }

    const p =
      worldToScreen(
        state.player.x,
        state.player.y
      );

    drawCharacter(
      ctx,
      p.x,
      p.y,
      1,
      state.player.character,
      state.npcAnim
    );

    if (
      state.dodgeTimer > 0
    ) {

      ctx.strokeStyle =
        "rgba(255,255,255,.6)";

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        38,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }
  }
}

/* =========================================================
   UPDATE
   ========================================================= */

function update(dt) {

  if (
    state.screen !== "world" ||
    state.opening ||
    state.paused ||
    state.dialogue ||
    state.shop ||
    state.dead
  ) {

    return;
  }

  state.npcAnim +=
    dt;

  state.attackCooldown =
    Math.max(
      0,
      state.attackCooldown - dt
    );

  state.dodgeCooldown =
    Math.max(
      0,
      state.dodgeCooldown - dt
    );

  if (
    state.dodgeTimer > 0
  ) {

    state.player.x +=
      state.dash.x *
      600 *
      dt;

    state.player.y +=
      state.dash.y *
      600 *
      dt;

    state.dodgeTimer -=
      dt;

  } else {

    let dx = 0;
    let dy = 0;

    if (
      state.keys.has("w")
    ) {

      dy--;
    }

    if (
      state.keys.has("s")
    ) {

      dy++;
    }

    if (
      state.keys.has("a")
    ) {

      dx--;
    }

    if (
      state.keys.has("d")
    ) {

      dx++;
    }

    if (
      dx ||
      dy
    ) {

      const len =
        Math.hypot(
          dx,
          dy
        );

      dx /= len;
      dy /= len;

      state.player.x +=
        dx *
        220 *
        dt;

      state.player.y +=
        dy *
        220 *
        dt;

      state.lastDirection = {
        x: dx,
        y: dy
      };
    }
  }

  const b =
    islandBounds();

  state.player.x =
    Math.max(
      35,
      Math.min(
        b.w - 35,
        state.player.x
      )
    );

/* =========================================================
   UPDATE
   ========================================================= */

function update(dt) {

  // ===== GAME STATE CHECK =====

  if (
    state.screen !== "world" ||
    state.opening ||
    state.paused ||
    state.dialogue ||
    state.shop ||
    state.dead
  ) {

    return;
  }


  // ===== NPC ANIMATION =====

  state.npcAnim += dt;


  // ===== COMBAT COOLDOWNS =====

  state.attackCooldown =
    Math.max(
      0,
      state.attackCooldown - dt
    );

  state.dodgeCooldown =
    Math.max(
      0,
      state.dodgeCooldown - dt
    );


  // ===== DODGE =====

  if (
    state.dodgeTimer > 0
  ) {

    state.player.x +=
      state.dash.x *
      600 *
      dt;

    state.player.y +=
      state.dash.y *
      600 *
      dt;

    state.dodgeTimer -=
      dt;

  } else {

    // ===== NORMAL MOVEMENT =====

    let dx = 0;
    let dy = 0;

    if (
      state.keys.has("w")
    ) {

      dy--;
    }

    if (
      state.keys.has("s")
    ) {

      dy++;
    }

    if (
      state.keys.has("a")
    ) {

      dx--;
    }

    if (
      state.keys.has("d")
    ) {

      dx++;
    }


    // ===== MOVEMENT SPEED =====

    if (
      dx ||
      dy
    ) {

      const len =
        Math.hypot(
          dx,
          dy
        );

      dx /= len;
      dy /= len;


      const moveSpeed =
        state.keys.has("shift")
          ? 330
          : 220;


      state.player.x +=
        dx *
        moveSpeed *
        dt;

      state.player.y +=
        dy *
        moveSpeed *
        dt;


      state.lastDirection = {
        x: dx,
        y: dy
      };
    }
  }


  // ===== ISLAND BOUNDS =====

  const b =
    islandBounds();

  state.player.x =
    Math.max(
      35,
      Math.min(
        b.w - 35,
        state.player.x
      )
    );

  state.player.y =
    Math.max(
      35,
      Math.min(
        b.h - 35,
        state.player.y
      )
    );


  // ===== CHARGING =====

  if (
    state.mouse.down
  ) {

    state.mouse.downTime +=
      dt;
  }


  // ===== MONSTERS =====

  updateMonsters(dt);


  // ===== INTERACTION =====

  checkInteraction();


  // ===== GAME TIME =====

  state.dayAccumulator +=
    dt;

  if (
    state.dayAccumulator >=
    60
  ) {

    state.dayAccumulator -=
      60;

    advanceTime(1);
  }


  // ===== HUD =====

  updateHUD();
}

/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(now) {

  const dt =
    Math.min(
      .05,
      (now -
        state.lastFrame) /
        1000
    );

  state.lastFrame =
    now;

  update(dt);

  draw();

  requestAnimationFrame(
    gameLoop
  );
}

/* =========================================================
   START
   ========================================================= */

hide("hud");

setScreen("title");

$("titleScreen")
  .addEventListener(
    "click",
    () => {

      if (
        state.screen ===
        "title"
      ) {

        setScreen("account");
      }
    }
  );

$("tabMenu")
  .addEventListener(
    "click",
    e => {

      if (
        e.target ===
        $("tabMenu")
      ) {

        $("closeTab").click();
      }
    }
  );

$("shopOverlay")
  .addEventListener(
    "click",
    e => {

      if (
        e.target ===
        $("shopOverlay")
      ) {

        closeShop();
      }
    }
  );

updateCharacterPreview();

requestAnimationFrame(
  gameLoop
);

requestAnimationFrame(
  gameLoop
);
