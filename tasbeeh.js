// Tasbeeh Counter Logic
const clickSound = new Audio('click.mp3');
const chimeSound = new Audio('chime.mp3');
const dhikrKeys = [
  'subhanallah',
  'alhamdulillah',
  'allahuakbar',
  'astaghfirullah',
  'lailahaillallah',
  'subhanallah-wa-bihamdihi',
  'subhanallahil-azim',
  'allahumma-salli-ala-muhammad',
  'la-hawla-wa-la-quwwata',
  'hasbunallahu-wa-ni-mal-wakeel',
  'rabbi-ghfir-li-wa-tub-alayya'
];

function updateDisplay(key) {
  const count = parseInt(localStorage.getItem('tasbeeh-' + key) || '0', 10);
  document.getElementById('count-' + key).textContent = count;
}

function animateCount(key) {
  const el = document.getElementById('count-' + key);
  el.classList.remove('pop');
  void el.offsetWidth; // force reflow
  el.classList.add('pop');
}

function animateCardGlow(key) {
  const card = document.querySelector('.tasbeeh-card[data-key="' + key + '"]');
  card.classList.remove('glow');
  void card.offsetWidth;
  card.classList.add('glow');
  setTimeout(() => card.classList.remove('glow'), 1200);
}

function playClick() {
  try { clickSound.currentTime = 0; clickSound.play(); } catch(e){}
}
function playChime() {
  try { chimeSound.currentTime = 0; chimeSound.play(); } catch(e){}
}

// Challenge logic
function updateChallenges() {
  // Challenge 1: SubhanAllah 100x
  const subCount = parseInt(localStorage.getItem('tasbeeh-subhanallah') || '0', 10);
  const subPct = Math.min(subCount / 100, 1) * 100;
  document.getElementById('progress-subhanallah-100').style.width = subPct + '%';
  if (subCount >= 100) {
    document.getElementById('badge-subhanallah-100').style.display = '';
    animateCardGlow('subhanallah');
    playChime();
    showCelebration('You completed SubhanAllah 100 times!');
  } else {
    document.getElementById('badge-subhanallah-100').style.display = 'none';
  }
  // Challenge 2: All dhikr 33x each
  let all33 = true, min33 = 9999;
  dhikrKeys.forEach(key => {
    const c = parseInt(localStorage.getItem('tasbeeh-' + key) || '0', 10);
    if (c < 33) all33 = false;
    min33 = Math.min(min33, c);
  });
  const all33Pct = Math.min(min33 / 33, 1) * 100;
  document.getElementById('progress-all-33').style.width = all33Pct + '%';
  if (all33) {
    document.getElementById('badge-all-33').style.display = '';
    playChime();
    showCelebration('MashaAllah! All dhikr completed 33 times each!');
    dhikrKeys.forEach(animateCardGlow);
  } else {
    document.getElementById('badge-all-33').style.display = 'none';
  }
}

let celebrationTimeout = null;
function showCelebration(msg) {
  const cel = document.getElementById('challenge-celebration');
  cel.textContent = msg;
  cel.style.display = '';
  clearTimeout(celebrationTimeout);
  celebrationTimeout = setTimeout(() => {
    cel.style.display = 'none';
  }, 2500);
}

dhikrKeys.forEach(key => {
  updateDisplay(key);
  document.querySelectorAll('.tasbeeh-increment[data-key="' + key + '"]').forEach(btn => {
    btn.addEventListener('click', () => {
      let count = parseInt(localStorage.getItem('tasbeeh-' + key) || '0', 10);
      count++;
      localStorage.setItem('tasbeeh-' + key, count);
      updateDisplay(key);
      animateCount(key);
      playClick();
      updateChallenges();
    });
  });
  document.querySelectorAll('.tasbeeh-reset[data-key="' + key + '"]').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem('tasbeeh-' + key, 0);
      updateDisplay(key);
      updateChallenges();
    });
  });
});

// Initial challenge bar update
updateChallenges();

// Optional: Reset all counters on page load (uncomment to enable)
// dhikrKeys.forEach(key => localStorage.setItem('tasbeeh-' + key, 0));
