// Animated, interactive logic for reminders page
// Rotating Hadith/Ayah/Motivational Quotes, animated cards, confetti, and more

document.addEventListener('DOMContentLoaded', function () {
  // --- Reminder pools ---
  const imaanBoost = [
    'Pray 2 rakats of Duha today 🌤️',
    'Make istighfar 100 times',
    'Send salawat on the Prophet ﷺ',
    'Recite Ayat al-Kursi after Fajr',
    'Do a secret good deed today',
    'Pray Tahajjud tonight',
    'Read a page of Quran',
    'Reflect on a blessing from Allah'
  ];
  const prayerReminders = [
    'Check time for next Salah',
    'Pray in congregation',
    'Make dua after Salah',
    'Renew your wudu',
    'Pray Sunnah before/after obligatory',
    'Prepare early for Salah',
    'Time left for next Salah: <span>--:--</span>'
  ];
  const sunnahReminders = [
    'Trim nails (Friday Sunnah)',
    'Read Surah Kahf – It’s Friday!',
    'Use miswak before Dhuhr',
    'Wear perfume before Jummah',
    'Smile at someone today',
    'Say Bismillah before eating',
    'Eat with right hand'
  ];
  const hadiths = [
    'Actions are judged by intentions. (Bukhari)',
    'The world is a prison for the believer and a paradise for the disbeliever. (Muslim)',
    'None of you truly believes until he loves for his brother what he loves for himself. (Bukhari)',
    'Purity is half of faith. (Muslim)',
    'Supplication is worship. (Tirmidhi)',
    'Charity does not decrease wealth. (Muslim)',
    'Allah is beautiful and loves beauty. (Muslim)'
  ];
  const ayahs = [
    'Indeed, prayer prohibits immorality and wrongdoing. (Quran 29:45)',
    'And He found you lost and guided [you]. (Quran 93:7)',
    'So remember Me; I will remember you. (Quran 2:152)',
    'Indeed, with hardship [will be] ease. (Quran 94:6)',
    'And your Lord is going to give you, and you will be satisfied. (Quran 93:5)',
    'Allah does not burden a soul beyond that it can bear. (Quran 2:286)'
  ];
  const todos = [
    'Study for exam 📚',
    'Call parents ❤️',
    'Submit assignment',
    'Tidy your room',
    'Plan your day',
    'Help a family member',
    'Make a healthy meal'
  ];
  const selfCare = [
    'Drink water 💧',
    'Stretch 5 min 🧘',
    'Gratitude: Write 1 thing you’re thankful for',
    'Go for a walk',
    'Take a deep breath',
    'Reflect on your progress',
    'Sleep early tonight'
  ];
  const quotes = [
    'Don’t lose hope in Allah’s mercy – Qur\'an 39:53',
    'The best among you are those who have the best manners and character. (Bukhari)',
    'Start with Bismillah and see the barakah!',
    'Dua is the weapon of the believer.',
    'Be like a flower that gives fragrance even to the hand that crushes it.',
    'Your heart is a garden. Plant only good seeds.'
  ];

  // --- Spotlight randomizer ---
  function pickRandom(arr, n = 1) {
    const copy = [...arr];
    const picked = [];
    for (let i = 0; i < n && copy.length; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      picked.push(copy.splice(idx, 1)[0]);
    }
    return picked;
  }

  function updateSpotlight() {
    const spotlightList = document.getElementById('spotlightList');
    if (!spotlightList) return;
    const items = [
      ...pickRandom(imaanBoost, 1),
      ...pickRandom(prayerReminders, 1),
      ...pickRandom(sunnahReminders, 1),
      ...pickRandom(hadiths, 1),
      ...pickRandom(ayahs, 1),
      ...pickRandom(todos, 1),
      ...pickRandom(selfCare, 1),
      ...pickRandom(quotes, 1)
    ];
    spotlightList.innerHTML = '';
    items.forEach((txt, i) => {
      const li = document.createElement('li');
      li.textContent = txt.replace(/<[^>]+>/g, ''); // remove any tags for safety
      li.classList.add('animated');
      spotlightList.appendChild(li);
      setTimeout(() => li.classList.remove('animated'), 700 + i * 80);
    });
    // Animate the card
    const card = document.getElementById('spotlightCard');
    if (card) {
      card.classList.remove('animate-spotlight');
      void card.offsetWidth;
      card.classList.add('animate-spotlight');
      conf.className = 'confetti';
      conf.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      conf.style.left = Math.random() * 100 + 'vw';
      conf.style.animationDelay = (Math.random() * 0.7) + 's';
      conf.style.animationDuration = (0.9 + Math.random() * 0.7) + 's';
      document.body.appendChild(conf);
      setTimeout(() => conf.remove(), 1700);
    }
  }
  confettiBurst();

  // Call updateSpotlight on load and every 10s
  // (inserted by Cascade)
}
updateSpotlight();
setInterval(updateSpotlight, 10000);

// --- Add motivational tip on hover ---
if (quoteEl) {
  quoteEl.addEventListener('mouseenter', function () {
    quoteEl.style.color = '#e0b84c';
    quoteEl.style.transition = 'color 0.3s';
  });
  quoteEl.addEventListener('mouseleave', function () {
    quoteEl.style.color = '';
  });
}

// --- Animate prayer countdown (dummy for now) ---
const countdownEl = document.querySelector('#prayerCountdown span');
if (countdownEl) {
  let mins = 90;
  function tick() {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    countdownEl.textContent = `${h}h ${m}m`;
    mins = mins > 0 ? mins - 1 : 90;
  }
  tick();
  setInterval(tick, 60000);
}
});

// --- Confetti CSS (inject if not present) ---
(function addConfettiCSS() {
  if (document.getElementById('confetti-css')) return;
  const style = document.createElement('style');
  style.id = 'confetti-css';
  style.innerHTML = `
    .confetti {
      position: fixed;
      top: -24px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      opacity: 0.84;
      z-index: 2999;
      pointer-events: none;
      animation: confetti-fall 1.4s ease-in forwards;
    }
    @keyframes confetti-fall {
      to {
        top: 110vh;
        opacity: 0;
        transform: rotate(220deg) scale(0.7);
      }
    }
  `;
  document.head.appendChild(style);
});