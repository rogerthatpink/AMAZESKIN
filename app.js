/**
 * AMAZESKIN - Main Application Logic & Recommendation Engine
 */

// Application State
const AppState = {
  profile: {
    skinType: "Combination",
    sensitivity: "Moderate",
    primaryGoals: ["Pores", "Dullness", "UV Protection"],
    completedQuiz: true,
    name: "Alex"
  },
  climate: {
    presetKey: "sunny_heat",
    name: "Sunny Summer Heat",
    city: "Los Angeles, CA",
    temp: 32,
    humidity: 28,
    uv: 9,
    aqi: 45,
    icon: "sun",
    climateAdvice: "Intense UV radiation & dry heat detected. Prioritize broad-spectrum SPF 50+ and antioxidant Vitamin C defense."
  },
  dailyLog: {
    feel: "Balanced",
    concerns: ["Dullness"],
    sleepHours: 7,
    waterLiters: 2.0,
    barrierStatus: "Healthy",
    lastLoggedDate: new Date().toISOString().split("T")[0]
  },
  routineTab: "AM", // 'AM' or 'PM'
  routineChecks: {
    AM: {},
    PM: {}
  },
  vanity: ["prod-cerave-cleanser", "prod-boj-sunscreen", "prod-to-ha"],
  cart: [],
  cartDiscount: 0,
  promoCodeApplied: "",
  streak: 5,
  currentTheme: "glow",
  chatMessages: [
    {
      sender: "ai",
      text: "Hello! I'm your Amazeskin AI Dermatological Advisor. I have live context on today's weather, UV index, and your active routine. How can I help with your skin ritual today?",
      time: "Just now"
    }
  ],
  activeTimer: {
    running: false,
    remainingSeconds: 180,
    totalSeconds: 180,
    label: "Active Wait Timer",
    intervalId: null
  }
};

// Storage Key
const STORAGE_KEY = "amazeskin_app_state_v1";

// Load from LocalStorage
function loadPersistedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.profile) AppState.profile = { ...AppState.profile, ...parsed.profile };
      if (parsed.climate) AppState.climate = { ...AppState.climate, ...parsed.climate };
      if (parsed.dailyLog) AppState.dailyLog = { ...AppState.dailyLog, ...parsed.dailyLog };
      if (parsed.routineChecks) AppState.routineChecks = parsed.routineChecks;
      if (parsed.vanity) AppState.vanity = parsed.vanity;
      if (parsed.cart) AppState.cart = parsed.cart;
      if (parsed.currentTheme) {
        AppState.currentTheme = parsed.currentTheme;
        applyThemeDOM(parsed.currentTheme);
      }
    }
  } catch (err) {
    console.warn("Could not load from localStorage, using defaults:", err);
  }
}

// Save to LocalStorage
function persistState() {
  try {
    const toSave = {
      profile: AppState.profile,
      climate: AppState.climate,
      dailyLog: AppState.dailyLog,
      routineChecks: AppState.routineChecks,
      vanity: AppState.vanity,
      cart: AppState.cart,
      currentTheme: AppState.currentTheme
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn("Could not persist to localStorage:", err);
  }
}

// -------------------------------------------------------------
// DYNAMIC RECOMMENDATION ENGINE
// -------------------------------------------------------------
function computeDailyRoutine() {
  const isAM = AppState.routineTab === "AM";
  const skinType = AppState.profile.skinType;
  const concerns = AppState.dailyLog.concerns || [];
  const feel = AppState.dailyLog.feel;
  const uv = AppState.climate.uv;
  const humidity = AppState.climate.humidity;
  const aqi = AppState.climate.aqi;

  const isBarrierCompromised = concerns.includes("Redness") || concerns.includes("Irritation") || feel === "Sensitive/Irritated";

  let steps = [];

  // --- Step 1: Cleanser ---
  steps.push({
    stepNumber: 1,
    role: "Cleanser",
    timeOfDay: isAM ? "AM" : "PM",
    productId: "prod-cerave-cleanser",
    tip: isAM ? "Gently cleanse with lukewarm water to preserve nighttime lipids." : "Double cleanse to melt away makeup, SPF, and particulate matter."
  });

  if (isBarrierCompromised) {
    // BARRIER EMERGENCY PROTOCOL
    if (isAM) {
      steps.push({
        stepNumber: 2,
        role: "Emergency Soothing Serum",
        timeOfDay: "AM",
        productId: "prod-to-ha",
        tip: "Gentle humectant hydration to relieve barrier dehydration without stinging."
      });
      steps.push({
        stepNumber: 3,
        role: "Intensive Barrier Recovery",
        timeOfDay: "AM",
        productId: "prod-lrp-cicaplast",
        tip: "Centella Asiatica & 5% Panthenol actively repair compromised lipid matrix."
      });
      steps.push({
        stepNumber: 4,
        role: "Physical/Soothing UV Shield",
        timeOfDay: "AM",
        productId: "prod-boj-sunscreen",
        tip: "SPF is mandatory even when compromised to protect inflamed skin from pigment damage."
      });
    } else {
      steps.push({
        stepNumber: 2,
        role: "Calming Moisture Barrier",
        timeOfDay: "PM",
        productId: "prod-lrp-cicaplast",
        tip: "All active acids and retinols suspended tonight. Focus entirely on lipid barrier reconstruction."
      });
      steps.push({
        stepNumber: 3,
        role: "Overnight Probiotic Seal",
        timeOfDay: "PM",
        productId: "prod-laneige-water-mask",
        tip: "Microbiome ferment locks in moisture while you rest."
      });
    }
    return { steps, isBarrierEmergency: true };
  }

  // --- NORMAL & TARGETED PROTOCOL ---
  if (isAM) {
    // AM Step 2: Antioxidant or Brightening
    if (uv >= 7 || concerns.includes("Dullness") || aqi > 100) {
      steps.push({
        stepNumber: 2,
        role: "Antioxidant Shield",
        timeOfDay: "AM",
        productId: "prod-skinceuticals-ce",
        timerMinutes: 3,
        tip: `High UV (${uv}) & urban exposure. Pure L-Ascorbic acid creates an 8x photoprotective shield.`
      });
    } else {
      steps.push({
        stepNumber: 2,
        role: "Brightening Niacinamide Dew",
        timeOfDay: "AM",
        productId: "prod-gr-dewdrops",
        timerMinutes: 1,
        tip: "Lightweight B3 balances sebum, strengthens barrier, and imparts all-day lit glow."
      });
    }

    // AM Step 3: Hydration
    if (humidity < 40 || skinType === "Dry" || concerns.includes("Dehydration")) {
      steps.push({
        stepNumber: 3,
        role: "Multi-Depth Hydration",
        timeOfDay: "AM",
        productId: "prod-to-ha",
        timerMinutes: 1,
        tip: `Low ambient humidity (${humidity}%). Multi-molecular Hyaluronic acid prevents transepidermal water loss.`
      });
    }

    // AM Step 4: Moisturizer
    if (skinType !== "Oily" || humidity < 50) {
      steps.push({
        stepNumber: steps.length + 1,
        role: "Peptide Firming Moisture",
        timeOfDay: "AM",
        productId: "prod-de-protini",
        tip: "Signal peptides plump and prep skin seamlessly under makeup and SPF."
      });
    }

    // AM Step 5: Sunscreen (Mandatory)
    steps.push({
      stepNumber: steps.length + 1,
      role: "Broad Spectrum Sunscreen",
      timeOfDay: "AM",
      productId: uv >= 8 ? "prod-lrp-anthelios" : "prod-boj-sunscreen",
      tip: uv >= 8 ? `Very High UV Index (${uv})! Reapply SPF every 2 hours if outdoors.` : "Organic grain-fermented SPF 50+ provides weightless daily defense."
    });

  } else {
    // PM ROUTINE
    // PM Step 2: Targeted Active
    if (concerns.includes("Breakouts") || concerns.includes("Pores") || feel === "Oily" || humidity > 75) {
      steps.push({
        stepNumber: 2,
        role: "BHA Pore Exfoliant",
        timeOfDay: "PM",
        productId: "prod-pc-bha",
        timerMinutes: 3,
        tip: "2% Salicylic acid dissolves lipid buildup deep inside pore linings to halt congestion."
      });
    } else if (concerns.includes("Texture") || concerns.includes("Uneven Tone")) {
      steps.push({
        stepNumber: 2,
        role: "Resurfacing AHA Complex",
        timeOfDay: "PM",
        productId: "prod-de-framboos",
        timerMinutes: 5,
        tip: "Multi-acid blend dissolves surface dead skin cells overnight for baby-soft texture."
      });
    } else {
      steps.push({
        stepNumber: 2,
        role: "Cellular Renewal Retinoid",
        timeOfDay: "PM",
        productId: "prod-to-retinol",
        timerMinutes: 3,
        tip: "Next-generation Granactive Retinoid boosts collagen and smooths fine lines with zero flaking."
      });
    }

    // PM Step 3: Moisture Barrier Lock
    if (skinType === "Dry" || humidity < 35 || feel === "Dry") {
      steps.push({
        stepNumber: 3,
        role: "Ceramide Barrier Recovery",
        timeOfDay: "PM",
        productId: "prod-lrp-cicaplast",
        tip: "Rich nourishing occlusive layer to repair daily weather fatigue while sleeping."
      });
    } else {
      steps.push({
        stepNumber: 3,
        role: "Peptide Firming Cream",
        timeOfDay: "PM",
        productId: "prod-de-protini",
        tip: "9-peptide complex reinforces elasticity and cellular replenishment overnight."
      });
    }

    // PM Step 4: Overnight Sleeping Mask (if extra thirsty)
    if (concerns.includes("Dehydration") || AppState.dailyLog.waterLiters < 1.5) {
      steps.push({
        stepNumber: steps.length + 1,
        role: "Probiotic Sleep Mask",
        timeOfDay: "PM",
        productId: "prod-laneige-water-mask",
        tip: "Probiotic squalane veil locks all active hydration in place until morning."
      });
    }
  }

  return { steps, isBarrierEmergency: false };
}

// -------------------------------------------------------------
// INGREDIENT CONFLICT SCANNER
// -------------------------------------------------------------
function scanRoutineConflicts(routineSteps) {
  const activeProducts = routineSteps
    .map(s => AMAZESKIN_PRODUCTS.find(p => p.id === s.productId))
    .filter(Boolean);

  const foundConflicts = [];

  for (let i = 0; i < activeProducts.length; i++) {
    for (let j = i + 1; j < activeProducts.length; j++) {
      const p1 = activeProducts[i];
      const p2 = activeProducts[j];

      const rule = INGREDIENT_CONFLICT_RULES.find(r => 
        (r.groupA === p1.ingredientGroup && r.groupB === p2.ingredientGroup) ||
        (r.groupB === p1.ingredientGroup && r.groupA === p2.ingredientGroup)
      );

      if (rule) {
        foundConflicts.push({
          rule,
          product1: p1,
          product2: p2
        });
      }
    }
  }

  return {
    isSafe: foundConflicts.length === 0,
    conflicts: foundConflicts
  };
}

// -------------------------------------------------------------
// WEB AUDIO API NOTIFIER CHIME
// -------------------------------------------------------------
function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.log("Audio chime note:", e);
  }
}

// -------------------------------------------------------------
// TIMER LOGIC
// -------------------------------------------------------------
function startActiveTimer(minutes, label) {
  clearInterval(AppState.activeTimer.intervalId);

  AppState.activeTimer.totalSeconds = minutes * 60;
  AppState.activeTimer.remainingSeconds = minutes * 60;
  AppState.activeTimer.label = label || "Active Absorption Timer";
  AppState.activeTimer.running = true;

  updateTimerUI();

  // Scroll to timer on mobile if needed
  const timerCard = document.getElementById("active-timer-card");
  if (timerCard) {
    timerCard.classList.add("ring-4", "ring-rose-400", "transition-all");
    setTimeout(() => timerCard.classList.remove("ring-4", "ring-rose-400"), 1200);
  }

  AppState.activeTimer.intervalId = setInterval(() => {
    if (AppState.activeTimer.remainingSeconds > 0) {
      AppState.activeTimer.remainingSeconds--;
      updateTimerUI();
    } else {
      clearInterval(AppState.activeTimer.intervalId);
      AppState.activeTimer.running = false;
      playChime();
      triggerConfetti(0.3);
      updateTimerUI();
      showToast("⏳ Active Absorbed!", `${AppState.activeTimer.label} is done! Proceed to the next step.`, "success");
    }
  }, 1000);
}

function pauseActiveTimer() {
  clearInterval(AppState.activeTimer.intervalId);
  AppState.activeTimer.running = false;
  updateTimerUI();
}

function resetActiveTimer() {
  clearInterval(AppState.activeTimer.intervalId);
  AppState.activeTimer.running = false;
  AppState.activeTimer.remainingSeconds = AppState.activeTimer.totalSeconds;
  updateTimerUI();
}

function updateTimerUI() {
  const mins = Math.floor(AppState.activeTimer.remainingSeconds / 60);
  const secs = AppState.activeTimer.remainingSeconds % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const displayEl = document.getElementById("timer-display");
  const labelEl = document.getElementById("timer-label");
  const progressRing = document.getElementById("timer-progress-ring");
  const toggleBtn = document.getElementById("timer-toggle-btn");

  if (displayEl) displayEl.textContent = timeStr;
  if (labelEl) labelEl.textContent = AppState.activeTimer.label;

  if (progressRing && AppState.activeTimer.totalSeconds > 0) {
    const fraction = AppState.activeTimer.remainingSeconds / AppState.activeTimer.totalSeconds;
    const circumference = 2 * Math.PI * 40; // r=40
    progressRing.style.strokeDashoffset = (1 - fraction) * circumference;
  }

  if (toggleBtn) {
    toggleBtn.innerHTML = AppState.activeTimer.running 
      ? `<i data-lucide="pause" class="w-4 h-4 mr-1.5"></i> Pause`
      : `<i data-lucide="play" class="w-4 h-4 mr-1.5"></i> Start`;
    if (window.lucide) window.lucide.createIcons();
  }
}

// -------------------------------------------------------------
// CART & COMMERCE LOGIC
// -------------------------------------------------------------
function addToCart(productId) {
  const existing = AppState.cart.find(item => item.productId === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    AppState.cart.push({ productId, qty: 1 });
  }
  persistState();
  renderCartUI();
  
  const product = AMAZESKIN_PRODUCTS.find(p => p.id === productId);
  showToast("Added to Bag!", `${product ? product.name : 'Product'} was added to your bag.`, "cart");
  triggerConfetti(0.2);
}

function updateCartQty(productId, delta) {
  const item = AppState.cart.find(i => i.productId === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    AppState.cart = AppState.cart.filter(i => i.productId !== productId);
  }
  persistState();
  renderCartUI();
}

function removeFromCart(productId) {
  AppState.cart = AppState.cart.filter(i => i.productId !== productId);
  persistState();
  renderCartUI();
}

function applyPromoCode(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (cleanCode === "GLOW20") {
    AppState.cartDiscount = 0.20;
    AppState.promoCodeApplied = "GLOW20";
    showToast("Promo Code Applied! 🎉", "20% off has been applied to your order.", "success");
  } else {
    showToast("Invalid Promo Code", "Try using GLOW20 for 20% off!", "error");
  }
  renderCartUI();
}

function calculateCartTotals() {
  let subtotal = 0;
  let itemCount = 0;

  AppState.cart.forEach(item => {
    const prod = AMAZESKIN_PRODUCTS.find(p => p.id === item.productId);
    if (prod) {
      subtotal += prod.price * item.qty;
      itemCount += item.qty;
    }
  });

  const discount = subtotal * AppState.cartDiscount;
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  const total = Math.max(0, subtotal - discount + shipping);

  return { subtotal, discount, shipping, total, itemCount };
}

// -------------------------------------------------------------
// VANITY SHELF LOGIC
// -------------------------------------------------------------
function toggleVanity(productId) {
  const index = AppState.vanity.indexOf(productId);
  const prod = AMAZESKIN_PRODUCTS.find(p => p.id === productId);
  if (index >= 0) {
    AppState.vanity.splice(index, 1);
    showToast("Removed from Vanity", `${prod ? prod.name : 'Item'} removed from your shelf.`, "info");
  } else {
    AppState.vanity.push(productId);
    showToast("Added to My Vanity ✨", `${prod ? prod.name : 'Item'} added to your shelf!`, "success");
    triggerConfetti(0.15);
  }
  persistState();
  renderApp();
}

// -------------------------------------------------------------
// TOAST NOTIFICATIONS
// -------------------------------------------------------------
function showToast(title, message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgColors = {
    success: "bg-emerald-900/90 text-white border-emerald-500/40",
    error: "bg-rose-900/90 text-white border-rose-500/40",
    cart: "bg-slate-900/90 text-white border-amber-400/40",
    info: "bg-slate-900/90 text-white border-slate-700/60"
  };

  const icons = {
    success: "check-circle",
    error: "alert-triangle",
    cart: "shopping-bag",
    info: "sparkles"
  };

  toast.className = `flex items-start gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${bgColors[type] || bgColors.info} transform transition-all duration-300 translate-y-4 opacity-0`;
  toast.innerHTML = `
    <div class="mt-0.5 p-1 rounded-full bg-white/10 shrink-0">
      <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4"></i>
    </div>
    <div class="flex-1 text-sm">
      <div class="font-bold tracking-tight">${title}</div>
      <div class="text-xs text-white/80 mt-0.5">${message}</div>
    </div>
    <button class="text-white/60 hover:text-white shrink-0 ml-2" onclick="this.parentElement.remove()">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  });

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// -------------------------------------------------------------
// CONFETTI CELEBRATION
// -------------------------------------------------------------
function triggerConfetti(intensity = 0.5) {
  if (typeof confetti === "function") {
    confetti({
      particleCount: Math.floor(60 * intensity),
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#06b6d4"]
    });
  }
}

// -------------------------------------------------------------
// CLIMATE ENGINE & GEOLOCATION
// -------------------------------------------------------------
function applyClimatePreset(key) {
  const preset = CLIMATE_PRESETS[key];
  if (!preset) return;

  AppState.climate = {
    presetKey: key,
    name: preset.name,
    city: preset.city,
    temp: preset.temp,
    humidity: preset.humidity,
    uv: preset.uv,
    aqi: preset.aqi,
    icon: preset.icon,
    climateAdvice: preset.climateAdvice
  };

  persistState();
  renderApp();
  showToast("Climate Updated 🌤️", `Switched forecast to ${preset.city} (${preset.name})`, "info");
}

function detectLiveLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation Unavailable", "Browser does not support geolocation.", "error");
    return;
  }

  showToast("Detecting Location...", "Connecting to atmospheric GPS and local weather satellite...", "info");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Query Open-Meteo free API (No API key needed)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,uv_index&timezone=auto`;
        const res = await fetch(weatherUrl);
        const data = await res.json();

        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          const humidity = Math.round(data.current.relative_humidity_2m);
          const uv = Math.round(data.current.uv_index || 5);

          AppState.climate = {
            presetKey: "live_geo",
            name: "Live Local Climate",
            city: `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
            temp,
            humidity,
            uv,
            aqi: 45, // default moderate urban
            icon: uv > 6 ? "sun" : "cloud-sun",
            climateAdvice: `Live local climate recorded: ${temp}°C, ${humidity}% humidity, UV Index ${uv}. Routine auto-tuned!`
          };

          persistState();
          renderApp();
          showToast("Live Weather Synced!", `Local UV ${uv}, Humidity ${humidity}%, Temp ${temp}°C`, "success");
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
        showToast("Live Weather Offline", "Falling back to simulated weather forecast.", "error");
      }
    },
    (err) => {
      console.warn("Geolocation permission error:", err);
      showToast("Location Access Denied", "Using climate simulator presets instead.", "info");
    }
  );
}

// -------------------------------------------------------------
// RENDER UI & ROUTINE COMPONENTS
// -------------------------------------------------------------
function renderApp() {
  renderClimateHeader();
  renderDailyCheckinBar();
  renderRoutineTracker();
  renderBarrierScoreWidget();
  renderVanityPreview();
  renderCartUI();
  updateTimerUI();

  if (window.lucide) window.lucide.createIcons();
}

function renderClimateHeader() {
  const el = document.getElementById("climate-forecast-banner");
  if (!el) return;

  const c = AppState.climate;
  const uvBadgeColor = c.uv >= 8 ? "bg-rose-500/10 text-rose-600 border-rose-200" :
                       c.uv >= 5 ? "bg-amber-500/10 text-amber-700 border-amber-200" :
                                   "bg-emerald-500/10 text-emerald-700 border-emerald-200";

  const humBadgeColor = c.humidity < 35 ? "bg-blue-500/10 text-blue-600 border-blue-200" :
                        c.humidity > 70 ? "bg-teal-500/10 text-teal-700 border-teal-200" :
                                          "bg-slate-500/10 text-slate-700 border-slate-200";

  el.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
          <i data-lucide="${c.icon || 'sun'}" class="w-6 h-6"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-slate-900">${c.city}</h2>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${uvBadgeColor} border">
              UV Index ${c.uv} (${c.uv >= 8 ? 'Very High' : c.uv >= 5 ? 'Moderate' : 'Low'})
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>🌡️ ${c.temp}°C</span>
            <span>•</span>
            <span>💧 ${c.humidity}% Humidity</span>
            <span>•</span>
            <span>🍃 AQI ${c.aqi}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start md:self-auto">
        <button onclick="openClimateModal()" class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm flex items-center gap-1.5 transition-all hover:bg-slate-50 active:scale-95">
          <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-rose-500"></i>
          Climate Simulator
        </button>
        <button onclick="detectLiveLocation()" class="p-2 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-700 shadow-sm flex items-center gap-1 transition-all hover:bg-rose-100 active:scale-95" title="Auto-detect via GPS">
          <i data-lucide="crosshair" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <div class="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80">
      <i data-lucide="sparkles" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
      <span class="font-medium">${c.climateAdvice}</span>
    </div>
  `;
}

function renderDailyCheckinBar() {
  const container = document.getElementById("daily-checkin-widget");
  if (!container) return;

  const currentFeel = AppState.dailyLog.feel;
  const currentConcerns = AppState.dailyLog.concerns || [];

  const feelOptions = ["Balanced", "Dry", "Oily", "Sensitive/Irritated"];
  const concernOptions = ["Breakouts", "Dullness", "Redness", "Dehydration", "Pores"];

  container.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">10-Second Skin Check-In</h3>
      </div>
      <span class="text-xs text-slate-400">Updates routine in real-time</span>
    </div>

    <div class="space-y-3">
      <!-- Skin Feeling Selector -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">How does your skin feel right now?</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${feelOptions.map(option => {
            const isSelected = currentFeel === option;
            const activeClasses = isSelected
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border-slate-900 font-bold"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 font-medium";
            return `
              <button onclick="setSkinFeel('${option}')" class="px-3 py-2 rounded-xl text-xs border transition-all text-center ${activeClasses}">
                ${option}
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Specific Concerns -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Any specific concerns today?</label>
        <div class="flex flex-wrap gap-2">
          ${concernOptions.map(concern => {
            const isSelected = currentConcerns.includes(concern);
            const activeClasses = isSelected
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-sm shadow-rose-500/20 border-transparent"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 font-medium";
            return `
              <button onclick="toggleSkinConcern('${concern}')" class="px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1.5 ${activeClasses}">
                ${isSelected ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
                ${concern}
              </button>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

function setSkinFeel(feel) {
  AppState.dailyLog.feel = feel;
  persistState();
  renderApp();
  showToast("Check-in Logged", `Skin feel set to ${feel}. Recommendations refreshed!`, "info");
}

function toggleSkinConcern(concern) {
  const list = AppState.dailyLog.concerns || [];
  const idx = list.indexOf(concern);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(concern);
  }
  AppState.dailyLog.concerns = list;
  persistState();
  renderApp();
}

function renderRoutineTracker() {
  const trackerEl = document.getElementById("routine-tracker-container");
  if (!trackerEl) return;

  const currentTab = AppState.routineTab;
  const { steps, isBarrierEmergency } = computeDailyRoutine();
  const conflictReport = scanRoutineConflicts(steps);

  // Tab switchers
  const amActive = currentTab === "AM";
  const pmActive = currentTab === "PM";

  // Calculate completed percentage
  const checks = AppState.routineChecks[currentTab] || {};
  const completedCount = steps.filter(s => checks[s.stepNumber]).length;
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  let conflictHtml = "";
  if (!conflictReport.isSafe) {
    conflictHtml = `
      <div class="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
        <div class="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-700">
          <i data-lucide="shield-alert" class="w-4 h-4 text-rose-600"></i>
          Ingredient Safety Shield: Incompatibility Alert
        </div>
        ${conflictReport.conflicts.map(c => `
          <div class="mt-2 text-xs">
            <p class="font-semibold text-rose-800">${c.rule.title}:</p>
            <p class="text-rose-700/90 mt-0.5">${c.rule.message}</p>
            <p class="text-rose-950 font-medium mt-1 bg-rose-100/60 p-2 rounded-lg">💡 Solution: ${c.rule.solution}</p>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    conflictHtml = `
      <div class="mb-4 px-3.5 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
          <span class="font-bold">100% Conflict-Free Routine</span>
          <span class="text-emerald-700 text-[11px] hidden sm:inline">• Actives safely synergized</span>
        </div>
        <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Derm Safe</span>
      </div>
    `;
  }

  let emergencyBanner = "";
  if (isBarrierEmergency) {
    emergencyBanner = `
      <div class="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 flex items-center gap-3">
        <div class="p-2 bg-amber-400 text-amber-950 rounded-xl shrink-0">
          <i data-lucide="alert-octagon" class="w-5 h-5"></i>
        </div>
        <div class="text-xs">
          <div class="font-bold uppercase tracking-wider text-amber-800">Barrier Emergency Protocol Active</div>
          <div class="text-amber-700 mt-0.5">Potent exfoliating acids and retinols are temporarily paused to facilitate rapid lipid barrier repair.</div>
        </div>
      </div>
    `;
  }

  trackerEl.innerHTML = `
    <!-- AM/PM Toggle Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
        <button onclick="setRoutineTab('AM')" class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${amActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          <i data-lucide="sun" class="w-4 h-4 text-amber-500"></i>
          AM Morning Routine
        </button>
        <button onclick="setRoutineTab('PM')" class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${pmActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          <i data-lucide="moon" class="w-4 h-4 text-indigo-500"></i>
          PM Night Ritual
        </button>
      </div>

      <!-- Completion Badge -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-500">${completedCount} of ${steps.length} done</span>
        <div class="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500" style="width: ${progressPct}%"></div>
        </div>
      </div>
    </div>

    ${emergencyBanner}
    ${conflictHtml}

    <!-- Routine Step Cards -->
    <div class="space-y-3">
      ${steps.map(step => {
        const prod = AMAZESKIN_PRODUCTS.find(p => p.id === step.productId);
        if (!prod) return "";
        const isChecked = !!checks[step.stepNumber];
        const isOwned = AppState.vanity.includes(prod.id);

        return `
          <div class="p-4 rounded-2xl border transition-all ${isChecked ? 'bg-slate-50/80 border-slate-200 opacity-75' : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'}">
            <div class="flex items-start justify-between gap-3">
              <!-- Step Checkbox & Info -->
              <div class="flex items-start gap-3.5 flex-1">
                <button onclick="toggleStepCheck(${step.stepNumber})" class="mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isChecked ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 hover:border-rose-400 bg-white'}">
                  ${isChecked ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
                </button>
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[11px] font-bold tracking-wider uppercase text-rose-500">Step ${step.stepNumber}: ${step.role}</span>
                    <span class="text-[11px] font-semibold text-slate-400">• ${prod.brand}</span>
                    ${isOwned ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">In Your Vanity ✨</span>' : ''}
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 mt-0.5 cursor-pointer hover:text-rose-600 transition-colors" onclick="openProductModal('${prod.id}')">${prod.name}</h4>
                  <p class="text-xs text-slate-500 mt-1">${step.tip}</p>

                  <!-- Active Key Badges -->
                  <div class="flex flex-wrap items-center gap-1.5 mt-2">
                    ${prod.actives.map(act => `<span class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">${act}</span>`).join("")}
                  </div>
                </div>
              </div>

              <!-- Product Thumbnail & Quick Actions -->
              <div class="flex flex-col items-end gap-2 shrink-0">
                <img src="${prod.image}" alt="${prod.name}" class="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-xs cursor-pointer hover:opacity-90" onclick="openProductModal('${prod.id}')">
                
                <div class="flex items-center gap-1">
                  ${step.timerMinutes ? `
                    <button onclick="startActiveTimer(${step.timerMinutes}, '${prod.name}')" class="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all flex items-center gap-1" title="Start Active Wait Timer">
                      <i data-lucide="timer" class="w-3 h-3"></i>
                      ${step.timerMinutes}m
                    </button>
                  ` : ''}

                  <button onclick="addToCart('${prod.id}')" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-1" title="Add to Bag">
                    <i data-lucide="shopping-bag" class="w-3 h-3"></i>
                    $${prod.price.toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function setRoutineTab(tab) {
  AppState.routineTab = tab;
  renderApp();
}

function toggleStepCheck(stepNumber) {
  const tab = AppState.routineTab;
  if (!AppState.routineChecks[tab]) {
    AppState.routineChecks[tab] = {};
  }
  const isDone = !AppState.routineChecks[tab][stepNumber];
  AppState.routineChecks[tab][stepNumber] = isDone;

  if (isDone) {
    playChime();
    triggerConfetti(0.2);
  }

  persistState();
  renderApp();
}

// -------------------------------------------------------------
// VANITY PREVIEW & SHELF DRAWER
// -------------------------------------------------------------
function renderVanityPreview() {
  const container = document.getElementById("vanity-preview-container");
  if (!container) return;

  const count = AppState.vanity.length;
  const ownedProds = AppState.vanity
    .map(id => AMAZESKIN_PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  container.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <i data-lucide="sparkles" class="w-4 h-4 text-amber-500"></i>
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">My Digital Vanity</h3>
      </div>
      <button onclick="openVanityModal()" class="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
        Manage (${count}) <i data-lucide="chevron-right" class="w-3 h-3"></i>
      </button>
    </div>

    ${ownedProds.length === 0 ? `
      <div class="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500">
        Your shelf is empty! Click the bookmark icon on products to add items you already own.
      </div>
    ` : `
      <div class="grid grid-cols-3 gap-2">
        ${ownedProds.slice(0, 3).map(p => `
          <div class="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center hover:bg-slate-100 transition-all cursor-pointer" onclick="openProductModal('${p.id}')">
            <img src="${p.image}" alt="${p.name}" class="w-full h-16 object-cover rounded-lg mb-1.5 shadow-2xs">
            <p class="text-[10px] font-bold text-slate-900 truncate">${p.name}</p>
            <p class="text-[9px] text-slate-400 truncate">${p.brand}</p>
          </div>
        `).join("")}
      </div>
    `}
  `;
}

// -------------------------------------------------------------
// CART & SHOPPING BAG DRAWER
// -------------------------------------------------------------
function renderCartUI() {
  const { subtotal, discount, shipping, total, itemCount } = calculateCartTotals();

  // Top header bag badge
  const headerBadge = document.getElementById("header-cart-count");
  if (headerBadge) {
    headerBadge.textContent = itemCount;
    headerBadge.classList.toggle("hidden", itemCount === 0);
  }

  const drawerContainer = document.getElementById("cart-drawer-items");
  if (!drawerContainer) return;

  if (AppState.cart.length === 0) {
    drawerContainer.innerHTML = `
      <div class="py-16 text-center text-slate-400">
        <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto stroke-1 mb-3 text-slate-300"></i>
        <p class="text-sm font-bold text-slate-700">Your bag is empty</p>
        <p class="text-xs text-slate-400 mt-1">Discover your climate-matched routine and add products!</p>
      </div>
    `;
  } else {
    drawerContainer.innerHTML = AppState.cart.map(item => {
      const prod = AMAZESKIN_PRODUCTS.find(p => p.id === item.productId);
      if (!prod) return "";
      return `
        <div class="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white shadow-2xs">
          <img src="${prod.image}" alt="${prod.name}" class="w-14 h-14 object-cover rounded-xl border border-slate-100">
          <div class="flex-1 min-w-0">
            <span class="text-[10px] uppercase font-bold text-rose-500">${prod.brand}</span>
            <h5 class="text-xs font-bold text-slate-900 truncate">${prod.name}</h5>
            <div class="text-xs font-semibold text-slate-700 mt-0.5">$${(prod.price * item.qty).toFixed(2)}</div>
          </div>
          <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button onclick="updateCartQty('${prod.id}', -1)" class="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center justify-center">-</button>
            <span class="text-xs font-bold px-1.5">${item.qty}</span>
            <button onclick="updateCartQty('${prod.id}', 1)" class="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center justify-center">+</button>
          </div>
          <button onclick="removeFromCart('${prod.id}')" class="text-slate-400 hover:text-rose-500 p-1">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }).join("");
  }

  // Summary fields
  const subtotalEl = document.getElementById("cart-subtotal");
  const discountEl = document.getElementById("cart-discount");
  const shippingEl = document.getElementById("cart-shipping");
  const totalEl = document.getElementById("cart-total");

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  if (window.lucide) window.lucide.createIcons();
}

function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  if (!drawer || !backdrop) return;

  drawer.classList.remove("translate-x-full");
  backdrop.classList.remove("hidden");
  renderCartUI();
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  if (!drawer || !backdrop) return;

  drawer.classList.add("translate-x-full");
  backdrop.classList.add("hidden");
}

// -------------------------------------------------------------
// CHECKOUT SIMULATION MODAL
// -------------------------------------------------------------
function openCheckoutModal() {
  if (AppState.cart.length === 0) {
    showToast("Bag is Empty", "Add products to your bag before checking out!", "info");
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById("checkout-modal");
  if (modal) {
    modal.classList.remove("hidden");
    const { total } = calculateCartTotals();
    const btn = document.getElementById("checkout-submit-btn");
    if (btn) btn.innerHTML = `Complete Order • $${total.toFixed(2)}`;
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  if (modal) modal.classList.add("hidden");
}

function completeOrder(e) {
  if (e) e.preventDefault();

  const name = document.getElementById("checkout-name")?.value || "Beauty Enthusiast";
  const email = document.getElementById("checkout-email")?.value || "alex@example.com";

  closeCheckoutModal();

  // Clear cart
  AppState.cart = [];
  AppState.cartDiscount = 0;
  AppState.promoCodeApplied = "";
  persistState();
  renderApp();

  triggerConfetti(1.0);
  playChime();

  // Show Confirmation Modal
  const confModal = document.getElementById("order-confirmation-modal");
  if (confModal) {
    const details = document.getElementById("order-conf-details");
    if (details) {
      details.innerHTML = `
        <p class="text-sm text-slate-600">Thank you, <strong class="text-slate-900">${name}</strong>! Your curated skin regimen has been dispatched to <strong>${email}</strong>.</p>
        <p class="text-xs text-slate-400 mt-2">Order #AMZ-${Math.floor(100000 + Math.random() * 900000)} • 2-Day Priority Carbon-Neutral Delivery</p>
      `;
    }
    confModal.classList.remove("hidden");
  }
}

// -------------------------------------------------------------
// PRODUCT DETAIL MODAL
// -------------------------------------------------------------
function openProductModal(productId) {
  const prod = AMAZESKIN_PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const modal = document.getElementById("product-detail-modal");
  const content = document.getElementById("product-detail-content");
  if (!modal || !content) return;

  const isOwned = AppState.vanity.includes(prod.id);

  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="relative">
        <img src="${prod.image}" alt="${prod.name}" class="w-full h-80 object-cover rounded-2xl shadow-md">
        <span class="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 shadow-sm">
          ${prod.badge || 'Curated'}
        </span>
      </div>

      <div class="flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase font-extrabold text-rose-500 tracking-wider">${prod.brand}</span>
            <div class="flex items-center text-amber-500 text-xs font-bold gap-1">
              <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
              ${prod.rating} (${prod.reviewsCount.toLocaleString()} reviews)
            </div>
          </div>

          <h3 class="text-xl font-extrabold text-slate-900 mt-1">${prod.name}</h3>
          <div class="text-lg font-bold text-slate-800 mt-2">$${prod.price.toFixed(2)}</div>

          <p class="text-xs text-slate-600 mt-3 leading-relaxed">${prod.description}</p>

          <div class="mt-4 p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-slate-700">
            <strong class="text-rose-700 flex items-center gap-1.5 mb-1">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-rose-500"></i> Why Amazeskin Chose This For Today:
            </strong>
            ${prod.whyRecommended || 'Perfect synergy for your climate and skin profile.'}
          </div>

          <div class="mt-4">
            <h5 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Key Active Ingredients</h5>
            <div class="flex flex-wrap gap-1.5">
              ${prod.actives.map(act => `<span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">${act}</span>`).join("")}
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
          <button onclick="addToCart('${prod.id}')" class="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i> Add to Bag • $${prod.price.toFixed(2)}
          </button>
          <button onclick="toggleVanity('${prod.id}')" class="p-3 rounded-xl border ${isOwned ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'} transition-all" title="Toggle Vanity Shelf">
            <i data-lucide="${isOwned ? 'bookmark-check' : 'bookmark'}" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeProductModal() {
  const modal = document.getElementById("product-detail-modal");
  if (modal) modal.classList.add("hidden");
}

// -------------------------------------------------------------
// CLIMATE SIMULATOR MODAL
// -------------------------------------------------------------
function openClimateModal() {
  const modal = document.getElementById("climate-modal");
  const listEl = document.getElementById("climate-presets-list");
  if (!modal || !listEl) return;

  listEl.innerHTML = Object.entries(CLIMATE_PRESETS).map(([key, p]) => {
    const isSelected = AppState.climate.presetKey === key;
    return `
      <div onclick="applyClimatePreset('${key}'); closeClimateModal();" class="p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-400' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'}">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <i data-lucide="${p.icon}" class="w-5 h-5 text-rose-500"></i>
            </div>
            <div>
              <h5 class="text-sm font-bold text-slate-900">${p.name}</h5>
              <p class="text-xs text-slate-500">${p.city}</p>
            </div>
          </div>
          <div class="text-right text-xs">
            <span class="font-bold text-slate-900">UV ${p.uv}</span> • <span>${p.humidity}% Humid</span>
          </div>
        </div>
        <p class="text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-100">${p.climateAdvice}</p>
      </div>
    `;
  }).join("");

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeClimateModal() {
  const modal = document.getElementById("climate-modal");
  if (modal) modal.classList.add("hidden");
}

// -------------------------------------------------------------
// FULL VANITY SHELF MODAL
// -------------------------------------------------------------
function openVanityModal() {
  const modal = document.getElementById("vanity-modal");
  const listEl = document.getElementById("vanity-catalog-list");
  if (!modal || !listEl) return;

  listEl.innerHTML = AMAZESKIN_PRODUCTS.map(p => {
    const isOwned = AppState.vanity.includes(p.id);
    return `
      <div class="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
        <div class="flex items-center gap-3">
          <img src="${p.image}" alt="${p.name}" class="w-12 h-12 rounded-xl object-cover">
          <div>
            <span class="text-[10px] uppercase font-bold text-rose-500">${p.brand}</span>
            <h5 class="text-xs font-bold text-slate-900">${p.name}</h5>
            <p class="text-[11px] text-slate-500">$${p.price.toFixed(2)}</p>
          </div>
        </div>
        <button onclick="toggleVanity('${p.id}'); openVanityModal();" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isOwned ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}">
          ${isOwned ? '✓ In Vanity' : '+ Add to Shelf'}
        </button>
      </div>
    `;
  }).join("");

  modal.classList.remove("hidden");
}

function closeVanityModal() {
  const modal = document.getElementById("vanity-modal");
  if (modal) modal.classList.add("hidden");
}

// -------------------------------------------------------------
// 1-MINUTE SKIN DIAGNOSTIC QUIZ
// -------------------------------------------------------------
function openQuizModal() {
  const modal = document.getElementById("quiz-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeQuizModal() {
  const modal = document.getElementById("quiz-modal");
  if (modal) modal.classList.add("hidden");
}

function submitQuiz(e) {
  if (e) e.preventDefault();

  const form = document.getElementById("skin-quiz-form");
  const formData = new FormData(form);

  const skinType = formData.get("quiz_skin_type") || "Combination";
  const sensitivity = formData.get("quiz_sensitivity") || "Moderate";
  const goals = formData.getAll("quiz_goals");

  AppState.profile.skinType = skinType;
  AppState.profile.sensitivity = sensitivity;
  if (goals.length > 0) AppState.profile.primaryGoals = goals;
  AppState.profile.completedQuiz = true;

  persistState();
  closeQuizModal();
  renderApp();

  triggerConfetti(0.8);
  playChime();
  showToast("Profile Updated! 🌸", `Optimized for ${skinType} Skin & ${goals.join(", ") || 'Radiance'}`, "success");
}

// -------------------------------------------------------------
// BARRIER HEALTH & STREAK WIDGET
// -------------------------------------------------------------
function renderBarrierScoreWidget() {
  const container = document.getElementById("barrier-health-widget");
  if (!container) return;

  const feel = AppState.dailyLog.feel;
  const concerns = AppState.dailyLog.concerns || [];
  const humidity = AppState.climate.humidity;
  const uv = AppState.climate.uv;

  // Compute dynamic barrier health score (0 - 100)
  let score = 96;
  if (feel === "Dry") score -= 8;
  if (feel === "Sensitive/Irritated") score -= 22;
  if (concerns.includes("Redness")) score -= 12;
  if (concerns.includes("Dehydration")) score -= 6;
  if (humidity < 30) score -= 5;
  if (uv >= 8) score -= 4;
  score = Math.max(48, Math.min(100, score));

  const statusLabel = score >= 90 ? "Optimal Barrier Resilience" :
                      score >= 75 ? "Balanced with Mild Stress" :
                                    "Compromised / Repair Mode";

  const statusColor = score >= 90 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                      score >= 75 ? "text-amber-700 bg-amber-50 border-amber-200" :
                                    "text-rose-700 bg-rose-50 border-rose-200";

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Mon = 0, Sun = 6

  container.innerHTML = `
    <div class="glass-card rounded-3xl p-6 shadow-sm border border-slate-200/80">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center shadow-xs">
            <i data-lucide="flame" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">${AppState.streak}-Day Glow Streak!</h3>
            <p class="text-[11px] text-slate-400">Consistency drives 80% of skin results</p>
          </div>
        </div>
        <span class="text-xs font-black px-2.5 py-1 rounded-full border ${statusColor}">
          ${score}% Health
        </span>
      </div>

      <!-- Weekly Streak Circles -->
      <div class="flex items-center justify-between gap-1.5 py-2">
        ${days.map((day, idx) => {
          const isDone = idx <= currentDayIndex;
          const isToday = idx === currentDayIndex;
          return `
            <div class="flex flex-col items-center gap-1">
              <span class="text-[10px] font-bold text-slate-400">${day}</span>
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isDone 
                  ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              } ${isToday ? 'ring-2 ring-rose-400 ring-offset-2' : ''}">
                ${isDone ? '✓' : ''}
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Status: <strong class="text-slate-800">${statusLabel}</strong></span>
        <button onclick="triggerConfetti(0.4); playChime(); showToast('Streak Celebrated! 🎉', 'You\\'re 5 days on track. Keep glowing!', 'success')" class="text-[11px] font-bold text-rose-600 hover:text-rose-700">
          Share Streak →
        </button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// AI SKIN CONCIERGE CHAT WIDGET
// -------------------------------------------------------------
function openChatModal() {
  const modal = document.getElementById("ai-chat-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderChatMessages();
}

function closeChatModal() {
  const modal = document.getElementById("ai-chat-modal");
  if (modal) modal.classList.add("hidden");
}

function renderChatMessages() {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  container.innerHTML = AppState.chatMessages.map(msg => {
    const isAi = msg.sender === "ai";
    return `
      <div class="flex items-start gap-2.5 ${isAi ? '' : 'flex-row-reverse'}">
        <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs ${
          isAi 
            ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white' 
            : 'bg-slate-900 text-white'
        }">
          ${isAi ? '✨' : 'You'}
        </div>
        <div class="max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
          isAi 
            ? 'bg-white border border-slate-200/90 text-slate-700 shadow-2xs' 
            : 'bg-slate-900 text-white'
        }">
          ${msg.text}
          <div class="text-[9px] mt-1.5 opacity-60 text-right">${msg.time}</div>
        </div>
      </div>
    `;
  }).join("");

  container.scrollTop = container.scrollHeight;
}

function sendChatMessage(queryText) {
  const inputEl = document.getElementById("chat-user-input");
  const text = (queryText || (inputEl ? inputEl.value : "")).trim();
  if (!text) return;

  if (inputEl) inputEl.value = "";

  // Add user message
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  AppState.chatMessages.push({
    sender: "user",
    text,
    time: now
  });

  renderChatMessages();

  // Generate intelligent response based on current context
  setTimeout(() => {
    const reply = generateAiResponse(text);
    AppState.chatMessages.push({
      sender: "ai",
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    playChime();
    renderChatMessages();
  }, 600);
}

function generateAiResponse(userQuery) {
  const q = userQuery.toLowerCase();
  const c = AppState.climate;
  const feel = AppState.dailyLog.feel;
  const concerns = AppState.dailyLog.concerns || [];

  if (q.includes("makeup") || q.includes("foundation")) {
    return `Yes! You can definitely wear makeup over your morning SPF. Allow your **${c.uv >= 8 ? 'La Roche-Posay Anthelios SPF 60' : 'Beauty of Joseon SPF 50+'}** to settle for 3 to 5 minutes so the UV protective film forms evenly. Then apply your primer or foundation using gentle tapping motions to avoid pilling!`;
  }

  if (q.includes("cicaplast") || q.includes("barrier") || q.includes("redness") || q.includes("peeling")) {
    return `Whenever you report skin redness, stinging, or barrier stress, Amazeskin triggers **Barrier Emergency Protocol**. We immediately swap out strong chemical exfoliants and retinols for **La Roche-Posay Cicaplast Baume B5+** (loaded with 5% Panthenol & Madecassoside) to accelerate lipid barrier recovery within 48 hours.`;
  }

  if (q.includes("vitamin c") && q.includes("niacinamide")) {
    return `Great scientific question! The old myth that Vitamin C and Niacinamide cancel each other out has been thoroughly debunked by modern cosmetic chemists. In contemporary stabilized formulas (like **SkinCeuticals C E Ferulic** + **Glow Recipe Dew Drops**), layering them offers complementary antioxidant photoprotection and pigment-fading benefits.`;
  }

  if (q.includes("reapply") || q.includes("sunscreen")) {
    return `Because today's UV Index in ${c.city} is **UV ${c.uv}**, reapplication every 2 hours outdoors is vital. If wearing makeup, use an SPF setting spray or a compact cushion sunscreen to refresh your UV shield without disturbing your look!`;
  }

  if (q.includes("retinol") || q.includes("acid") || q.includes("exfoliat")) {
    return `Our rule is: **never mix Retinoids and Direct Acids (AHA/BHA) on the same evening**. Doing so severely alters skin pH and compromises the stratum corneum. Alternate nights instead: Night 1 for chemical exfoliation (e.g. Paula's Choice 2% BHA), and Night 2 for Retinoid cellular renewal.`;
  }

  // General contextual answer
  return `Based on today's conditions in **${c.city}** (UV ${c.uv}, ${c.humidity}% humidity, temp ${c.temp}°C) and your **${feel}** skin status, your prescribed routine prioritizes barrier balance and environmental defense. Let me know if you'd like advice on specific active layering!`;
}

// -------------------------------------------------------------
// MULTI-AGENT BOARD MODAL & AUDIT
// -------------------------------------------------------------
function openAgentModal() {
  const modal = document.getElementById("agent-board-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeAgentModal() {
  const modal = document.getElementById("agent-board-modal");
  if (modal) modal.classList.add("hidden");
}

function triggerAgentAuditSimulation() {
  showToast("Running Autonomous Audit...", "Agents 1-6 are validating UI, formulas, market pricing & compliance...", "info");
  
  setTimeout(() => {
    playChime();
    triggerConfetti(0.6);
    showToast(
      "Audit Certified 100% Passed! 🤖",
      "Creative Design, QA, Zero-Side-Effect Safety, Market Sync & Governance verified.",
      "success"
    );
  }, 1000);
}

// -------------------------------------------------------------
// THEME SWITCHER LOGIC
// -------------------------------------------------------------
function openThemeModal() {
  const modal = document.getElementById("theme-modal");
  if (modal) {
    modal.classList.remove("hidden");
    updateThemeUI();
  }
}

function closeThemeModal() {
  const modal = document.getElementById("theme-modal");
  if (modal) modal.classList.add("hidden");
}

function applyThemeDOM(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.body.setAttribute("data-theme", theme);
}

function setTheme(theme, notify = true) {
  AppState.currentTheme = theme;
  applyThemeDOM(theme);
  persistState();
  updateThemeUI();

  if (notify) {
    playChime();
    triggerConfetti(0.25);
    const themeLabels = {
      glow: "🌸 Glow Modern (Clean Beauty)",
      luxury: "🌿 Editorial Luxury (Aesop / Rhode)",
      clinical: "🔬 Clinical Science (SkinCeuticals)",
      midnight: "🌙 Midnight Noir (Dark Mode)"
    };
    showToast("Theme Updated!", `Switched to ${themeLabels[theme] || theme}`, "info");
    setTimeout(closeThemeModal, 350);
  }
}

function updateThemeUI() {
  const current = AppState.currentTheme || "glow";
  const cards = document.querySelectorAll("[data-theme-card]");

  cards.forEach(card => {
    const key = card.getAttribute("data-theme-card");
    const checkEl = card.querySelector(".theme-check-icon");
    const isActive = key === current;

    if (isActive) {
      card.classList.add("ring-2", "ring-offset-2", "border-rose-500", "scale-[1.02]");
      if (checkEl) checkEl.classList.remove("hidden");
    } else {
      card.classList.remove("ring-2", "ring-offset-2", "border-rose-500", "scale-[1.02]");
      if (checkEl) checkEl.classList.add("hidden");
    }
  });
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  loadPersistedState();
  applyThemeDOM(AppState.currentTheme || "glow");
  renderApp();

  // Active Timer Event Listeners
  const toggleBtn = document.getElementById("timer-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (AppState.activeTimer.running) {
        pauseActiveTimer();
      } else {
        startActiveTimer(AppState.activeTimer.remainingSeconds / 60, AppState.activeTimer.label);
      }
    });
  }

  const resetBtn = document.getElementById("timer-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetActiveTimer);
  }

  // Promo code apply
  const promoBtn = document.getElementById("apply-promo-btn");
  if (promoBtn) {
    promoBtn.addEventListener("click", () => {
      const codeInput = document.getElementById("cart-promo-input");
      if (codeInput) applyPromoCode(codeInput.value);
    });
  }

  // Real-time clock update in header
  const timeDisplay = document.getElementById("header-current-date");
  if (timeDisplay) {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  }
});
