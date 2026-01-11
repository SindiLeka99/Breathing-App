let isBreathing = false;
let breathingInterval;
let timerInterval;
let startTime;
let currentPhase = "inhale";
let activeSound = null;
let currentAudio = null;

const audioFiles = {
  rain: 'Rain.mp3',
  ocean: 'Ocean.mp3',
  underwater: 'Underwater.mp3',
  forest: 'Forest.mp3',
  wind: 'Wind.mp3',
  fire: 'Fire.mp3',
  meditation: 'Meditation.mp3',
  nostalgia: 'Nostalgia.mp3'
};

function createParticles() {
  const container = document.querySelector(".bg-particles");
  for (let i = 0; i < 35; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 8 + "s";
    particle.style.animationDuration = 8 + Math.random() * 4 + "s";
    container.appendChild(particle);
  }
}

function toggleSound(soundType) {
  document.querySelectorAll(".sound-btn").forEach((btn) => btn.classList.remove("active"));

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (soundType === "silence" || activeSound === soundType) {
    activeSound = null;
    return;
  }

  activeSound = soundType;
  event.target.classList.add("active");

  playAmbientSound(soundType);
}

function playAmbientSound(type) {
  if (!audioFiles[type]) return;

  currentAudio = new Audio(audioFiles[type]);
  currentAudio.loop = true;
  currentAudio.volume = 0.5;

  if (type === 'ocean' || type === 'rain') {
    currentAudio.volume = 0.6;
  } else if (type === 'meditation' || type === 'nostalgia') {
    currentAudio.volume = 0.4;
  } else if (type === 'wind' || type === 'underwater') {
    currentAudio.volume = 0.45;
  }

  currentAudio.play().catch(err => {
    console.error('Error playing audio:', err);
  });
}

function playBreathSound() {
  if (!audioFiles.breath) return;

  if (breathAudio) {
    breathAudio.pause();
    breathAudio.currentTime = 0;
  }

  breathAudio = new Audio(audioFiles.breath);
  breathAudio.volume = 0.6;
  breathAudio.loop = false; 

  breathAudio.play().catch(err => {
    console.error('Error playing breath audio:', err);
  });
}

function toggleBreathing() {
  const circle = document.getElementById("breathingCircle");
  const instruction = document.getElementById("instruction");
  const playBtn = document.getElementById("playBtn");

  if (!isBreathing) {
    startBreathing();
    playBtn.textContent = "Pause";
    playBtn.classList.add("active");
  } else {
    stopBreathing();
    playBtn.textContent = "Start";
    playBtn.classList.remove("active");
  }
}

function startBreathing() {
  isBreathing = true;
  startTime = Date.now();
  const circle = document.getElementById("breathingCircle");
  const instruction = document.getElementById("instruction");

  circle.classList.add("breathe-animate", "active");
  instruction.classList.add("active");

  startTimer();
  startBreathingCycle();
}

function stopBreathing() {
  isBreathing = false;
  const circle = document.getElementById("breathingCircle");
  const instruction = document.getElementById("instruction");

  circle.classList.remove("breathe-animate", "active");
  instruction.classList.remove("active");

  if (breathingInterval) clearInterval(breathingInterval);
  if (timerInterval) clearInterval(timerInterval);
}

function startBreathingCycle() {
  updateInstruction();

  breathingInterval = setInterval(() => {
    currentPhase =
      currentPhase === "inhale"
        ? "hold"
        : currentPhase === "hold"
        ? "exhale"
        : currentPhase === "exhale"
        ? "rest"
        : "inhale";
    updateInstruction();
  }, 2000);
}

function updateInstruction() {
  const instruction = document.getElementById("instruction");

  const messages = {
    inhale: "Breathe in slowly...",
    hold: "Hold your breath...",
    exhale: "Breathe out gently...",
    rest: "Rest and Prepare...",
  };

  instruction.textContent = messages[currentPhase];
}

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    document.getElementById("timer").textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, 1000);
}

function resetSession() {
  stopBreathing();
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("instruction").textContent = "Click the circle to begin";
  document.getElementById("playBtn").textContent = "Start";
  currentPhase = "inhale";
}


createParticles();
