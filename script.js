const timer = document.getElementById("timer");
const modeText = document.getElementById("modeText");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const resetBtn = document.getElementById("resetBtn");

const focusInput = document.getElementById("focusInput");
const breakInput = document.getElementById("breakInput");

const historyList = document.getElementById("historyList");

const alarm = document.getElementById("alarm");

// ---------------- STATE ----------------
let focusTime = 25 * 60;
let breakTime = 5 * 60;

let currentTime = focusTime;

let isRunning = false;
let isPaused = false;
let isFocus = true;

let interval = null;

// ---------------- DISPLAY ----------------
function updateDisplay() {
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;

  timer.innerText =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ---------------- TIMER START ----------------
function startTimer() {

  if (isRunning) return;

  focusTime = Number(focusInput.value) * 60;
  breakTime = Number(breakInput.value) * 60;

  currentTime = isFocus ? focusTime : breakTime;

  isRunning = true;
  isPaused = false;

  interval = setInterval(() => {

    currentTime--;
    updateDisplay();

    if (currentTime <= 0) {

      clearInterval(interval);
      alarm.play();

      // ✅ SAVE ONLY WHEN FOCUS ENDS
      if (isFocus) {
        saveHistory();
      }

      // SWITCH MODE
      isFocus = !isFocus;

      if (isFocus) {
        modeText.innerText = "FOCUS MODE";
        document.body.classList.remove("break-mode");
        currentTime = focusTime;
      } else {
        modeText.innerText = "BREAK MODE";
        document.body.classList.add("break-mode");
        currentTime = breakTime;
      }

      isRunning = false;

      // auto restart next session
      startTimer();
    }

  }, 1000);
}

// ---------------- PAUSE ----------------
function pauseTimer() {

  if (!isRunning) return;

  clearInterval(interval);

  isRunning = false;
  isPaused = true;

  modeText.innerText = "PAUSED";
  document.body.classList.add("paused");
}

// ---------------- RESUME ----------------
function resumeTimer() {

  if (!isPaused) return;

  document.body.classList.remove("paused");

  modeText.innerText = isFocus ? "FOCUS MODE" : "BREAK MODE";

  startTimer();
}

// ---------------- RESET ----------------
function resetTimer() {

  clearInterval(interval);

  isRunning = false;
  isPaused = false;
  isFocus = true;

  focusTime = Number(focusInput.value) * 60;
  breakTime = Number(breakInput.value) * 60;

  currentTime = focusTime;

  modeText.innerText = "FOCUS MODE";

  document.body.classList.remove("paused");
  document.body.classList.remove("break-mode");

  updateDisplay();
}

// ---------------- HISTORY ----------------
function saveHistory() {

  const today = new Date().toDateString();

  const savedDate = localStorage.getItem("historyDate");

  if (savedDate !== today) {
    localStorage.removeItem("sessions");
  }

  localStorage.setItem("historyDate", today);

  const sessions =
    JSON.parse(localStorage.getItem("sessions")) || [];

  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  sessions.push(`✓ ${focusInput.value}:00 focus — ${time}`);

  localStorage.setItem("sessions", JSON.stringify(sessions));

  loadHistory();
}

// ---------------- LOAD HISTORY ----------------
function loadHistory() {

  const today = new Date().toDateString();
  const savedDate = localStorage.getItem("historyDate");

  if (savedDate !== today) {
    localStorage.removeItem("sessions");
    localStorage.setItem("historyDate", today);
  }

  const sessions =
    JSON.parse(localStorage.getItem("sessions")) || [];

  historyList.innerHTML = "";

  sessions.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    historyList.appendChild(li);
  });
}

// ---------------- EVENTS ----------------
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resumeBtn.addEventListener("click", resumeTimer);
resetBtn.addEventListener("click", resetTimer);

// ---------------- INIT ----------------
updateDisplay();
loadHistory();