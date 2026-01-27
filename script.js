let isBreathing = false;
let breathingInterval;
let timerInterval;
let startTime;
let sessionStartTime;
let currentPhase = "inhale";
let activeSound = null;
let currentAudio = null;
let breathAudio = null;

const audioFiles = {
  rain: 'Rain.mp3',
  ocean: 'Ocean.mp3',
  underwater: 'Underwater.mp3',
  forest: 'Forest.mp3',
  wind: 'Wind.mp3',
  fire: 'Fire.mp3',
  meditation: 'Meditation.mp3',
  nostalgia: 'Nostalgia.mp3',
  breath: 'Breathe.mp3'
};

function loadHistory() {
  const history = localStorage.getItem('meditationHistory');
  return history ? JSON.parse(history) : [];
}

function saveHistory(history) {
  localStorage.setItem('meditationHistory', JSON.stringify(history));
}

function saveSession(duration) {
  if (duration < 10) return; 
  
  const history = loadHistory();
  const session = {
    date: new Date().toISOString(),
    duration: duration,
    timestamp: Date.now()
  };
  history.push(session);
  saveHistory(history);
}

function calculateStats() {
  const history = loadHistory();
  if (history.length === 0) {
    return {
      totalTime: 0,
      thisWeekSessions: 0,
      longestStreak: 0,
      averageLength: 0,
      totalSessions: 0
    };
  }

  const totalTime = history.reduce((sum, session) => sum + session.duration, 0);
  const averageLength = Math.floor(totalTime / history.length);

  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const thisWeekSessions = history.filter(s => s.timestamp >= oneWeekAgo).length;

  const dates = history.map(s => new Date(s.date).toDateString());
  const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(a) - new Date(b));
  
  let longestStreak = 0;
  let currentStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    totalTime,
    thisWeekSessions,
    longestStreak,
    averageLength,
    totalSessions: history.length
  };
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) {
    return `${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

function toggleHistory() {
  const historyPanel = document.getElementById('historyPanel');
  const isVisible = historyPanel.style.display === 'block';
  
  if (isVisible) {
    historyPanel.style.display = 'none';
  } else {
    historyPanel.style.display = 'block';
    displayHistory();
  }
}

function displayHistory() {
  const stats = calculateStats();
  const history = loadHistory().reverse(); 
  
  document.getElementById('totalTime').textContent = formatDuration(stats.totalTime);
  document.getElementById('weekSessions').textContent = stats.thisWeekSessions;
  document.getElementById('longestStreak').textContent = `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`;
  document.getElementById('avgLength').textContent = formatDuration(stats.averageLength);
  
  const historyList = document.getElementById('historyList');
  
  if (history.length === 0) {
    historyList.innerHTML = '<div class="no-history">No meditation sessions yet. Start your first session!</div>';
    return;
  }
  
  historyList.innerHTML = history.map(session => {
    return `
      <div class="history-item">
        <div class="history-date">${formatDate(session.date)}</div>
        <div class="history-duration">${formatDuration(session.duration)}</div>
      </div>
    `;
  }).join('');
}

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
  breathAudio.loop = true; 

  breathAudio.play().catch(err => {
    console.error('Error playing breath audio:', err);
  });
}

function stopBreathSound() {
  if (breathAudio) {
    breathAudio.pause();
    breathAudio.currentTime = 0;
    breathAudio = null;
  }
}

function toggleBreathing() {
  const circle = document.getElementById("breathingCircle");
  const instruction = document.getElementById("instruction");
  const playBtn = document.getElementById("playBtn");

  if (!isBreathing) {
    startBreathing();
    playBtn.textContent = "Pause";
    playBtn.classList.add("active");
    playBreathSound(); 
  } else {
    stopBreathing();
    playBtn.textContent = "Start";
    playBtn.classList.remove("active");
    stopBreathSound(); 
  }
}

function startBreathing() {
  isBreathing = true;
  startTime = Date.now();
  sessionStartTime = Date.now(); 
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
  
  if (sessionStartTime) {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    saveSession(duration);
    sessionStartTime = null;
  }
}

function startBreathingCycle() {
  updateInstruction();

  breathingInterval = setInterval(() => {
    currentPhase = currentPhase === "inhale" ? "exhale" : "inhale";
    updateInstruction();
  }, currentPhase === "inhale" ? 6000 : 7000); 
}

function updateInstruction() {
  const instruction = document.getElementById("instruction");

  const messages = {
    inhale: "Breathe in slowly...",
    exhale: "Breathe out gently..."
  };

  instruction.textContent = messages[currentPhase];
  
  if (breathingInterval) clearInterval(breathingInterval);
  breathingInterval = setInterval(() => {
    currentPhase = currentPhase === "inhale" ? "exhale" : "inhale";
    updateInstruction();
  }, currentPhase === "inhale" ? 6000 : 7000);
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
  stopBreathSound(); 
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("instruction").textContent = "Click the circle to begin";
  document.getElementById("playBtn").textContent = "Start";
  currentPhase = "inhale";
}

createParticles();
