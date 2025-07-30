document.addEventListener('DOMContentLoaded', function () {
  // === Prayer Dashboard Logic ===
  const PRAYER_LIST = [
    { key: 'Fajr', ar: 'الفجر', card: 'fajr', bg: 'sunrise' },
    { key: 'Dhuhr', ar: 'الظهر', card: 'dhuhr', bg: 'daylight' },
    { key: 'Asr', ar: 'العصر', card: 'asr', bg: 'afternoon' },
    { key: 'Maghrib', ar: 'المغرب', card: 'maghrib', bg: 'sunset' },
    { key: 'Isha', ar: 'العشاء', card: 'isha', bg: 'night' }
  ];

  // --- Utility: Get current local time ---
  function getNow() {
    return new Date();
  }

  // --- Location ---
  function setLocationDisplay(lat, lon, locationObj = {}) {
    const loc = document.getElementById('live-location');
    let display = '';
    // If in Mangalore (12.85 < lat < 12.98, 74.75 < lon < 74.95), force Mangalore
    if (lat > 12.85 && lat < 12.98 && lon > 74.75 && lon < 74.95) {
      display = 'Mangalore, Karnataka';
    } else if (locationObj.city || locationObj.town || locationObj.village || locationObj.hamlet || locationObj.suburb) {
      let city = locationObj.city || locationObj.town || locationObj.village || locationObj.hamlet || locationObj.suburb;
      let state = locationObj.state || '';
      display = state ? `${city}, ${state}` : city;
    } else {
      display = `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    }
    if (loc) loc.textContent = display;
  }
  // --- Location, Timezone, and Local Time ---
  function fetchAndSetLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // Try to get city name
        let city = '';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          city = data.address.city || data.address.town || data.address.village || '';
        } catch { }
        setLocationDisplay(lat, lon, city);
        fetchPrayerTimes(lat, lon);
        // --- Fetch timezone and current local time for coordinates ---
        // NOTE: You must add your TimeZoneDB API key below
        const TIMEZONEDB_API_KEY = 'YOUR_API_KEY_HERE';
        // Utility to pad numbers
        function pad2(n) { return String(Math.abs(n)).padStart(2, '0'); }
        try {
          const tzRes = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}`);
          const tzData = await tzRes.json();
          if (tzData.status === 'OK' && tzData.formatted && typeof tzData.gmtOffset === 'number') {
            // Convert offset seconds to +HH:MM or -HH:MM
            const offsetSec = tzData.gmtOffset;
            const sign = offsetSec >= 0 ? '+' : '-';
            const absSec = Math.abs(offsetSec);
            const hours = pad2(Math.floor(absSec / 3600));
            const minutes = pad2(Math.floor((absSec % 3600) / 60));
            const offsetStr = `${sign}${hours}:${minutes}`;
            // Build ISO string
            const localTimeStr = tzData.formatted.replace(' ', 'T') + offsetStr;
            baseTime = new Date(localTimeStr);
            timeOffset = Date.now() - baseTime.getTime();
          } else {
            // Fallback: use browser's local time
            baseTime = new Date();
            timeOffset = Date.now() - baseTime.getTime();
            console.warn('Timezone API did not return usable data, using browser local time.');
          }
        } catch (e) {
          // Fallback: use browser's local time
          baseTime = new Date();
          timeOffset = Date.now() - baseTime.getTime();
          console.warn('Could not fetch timezone info, using browser local time.');
        }
      }, () => {
        setLocationDisplay(11.2588, 75.7804, 'Kozhikode');
        fetchPrayerTimes(11.2588, 75.7804);
      });
    } else {
      setLocationDisplay(11.2588, 75.7804, 'Kozhikode');
      fetchPrayerTimes(11.2588, 75.7804);
    }
  }


  // --- Gregorian/Hijri Dates ---
  function setDates() {
    const now = getNow();
    // Gregorian
    const gregorian = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('gregorian-date').textContent = gregorian;
    // Hijri (via API)
    fetch(`https://api.aladhan.com/v1/gToH?date=${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`)
      .then(r => r.json())
      .then(data => {
        if (data.data && data.data.hijri) {
          document.getElementById('hijri-date').textContent = `${data.data.hijri.day} ${data.data.hijri.month.en} ${data.data.hijri.year}`;
        }
      });
  }

  // --- Prayer Times & Countdown ---
  let prayerTimes = {};
  function to24Hour(timeStr) {
    // Converts '07:12 PM' or '7:12 PM' or '19:12' to '19:12'
    if (!timeStr) return '00:00';
    let t = timeStr.trim();
    if (/AM|PM/i.test(t)) {
      let [h, m] = t.replace(/AM|PM/i, '').trim().split(':');
      h = parseInt(h, 10);
      m = parseInt(m, 10);
      if (/PM/i.test(timeStr) && h !== 12) h += 12;
      if (/AM/i.test(timeStr) && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    // Already 24-hour
    let [h, m] = t.split(':');
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function fetchPrayerTimes(lat, lon) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
      .then(r => r.json())
      .then(data => {
        const timings = data.data.timings;
        PRAYER_LIST.forEach(prayer => {
          const t24 = to24Hour(timings[prayer.key]);
          prayerTimes[prayer.key] = t24;
          // Always display in 24-hour format
          document.getElementById(`${prayer.card}-time`).textContent = t24;
        });
        startCountdowns();
      });
  }


  function parsePrayerTime(timeStr, now) {
    // timeStr: "05:12" or "18:53"; returns a Date object for today
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  }

  function getNextPrayer(now, prayerTimes) {
    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    for (let i = 0; i < prayerOrder.length; i++) {
      let prayerTimeStr = prayerTimes[prayerOrder[i]] || '00:00';
      let prayerDate = parsePrayerTime(prayerTimeStr, now);
      if (window.DEBUG_PRAYER_CLOCK) {
        console.log(`[DEBUG] Checking next prayer: now=${now.toTimeString()}, ${prayerOrder[i]}=${prayerTimeStr}, prayerDate=${prayerDate.toTimeString()}`);
      }
      if (now < prayerDate) return prayerOrder[i];
    }
    // After Isha, next is tomorrow's Fajr
    return 'Fajr';
  }

  // Utility: Get next prayer time as Date object
  function getNextPrayerTime(now, prayerTimes) {
    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    for (let i = 0; i < prayerOrder.length; i++) {
      let prayerTimeStr = prayerTimes[prayerOrder[i]] || '00:00';
      let prayerDate = parsePrayerTime(prayerTimeStr, now);
      if (now < prayerDate) return prayerDate;
    }
    // After Isha: Fajr of next day
    let fajrTimeStr = prayerTimes['Fajr'] || '00:00';
    let fajrDate = parsePrayerTime(fajrTimeStr, now);
    fajrDate.setDate(fajrDate.getDate() + 1);
    return fajrDate;
  }

  function startCountdowns() {
    function updateAll() {
      const now = getNow();
      // Build array of {prayer, time: Date}
      const prayerTimesArr = PRAYER_LIST.map(prayer => {
        let t = parsePrayerTime(prayerTimes[prayer.key], now);
        // If time already passed, set to tomorrow
        if (t < now) t.setDate(t.getDate() + 1);
        return { ...prayer, time: t };
      });
      // Sort by time ascending
      prayerTimesArr.sort((a, b) => a.time - b.time);
      // Find next prayer using utility
      let nextPrayerKey = getNextPrayer(now, prayerTimes);
      let nextPrayer = prayerTimesArr.find(pt => pt.key === nextPrayerKey) || prayerTimesArr[0];
      // Update all card countdowns
      prayerTimesArr.forEach(pt => {
        const diff = pt.time - now;
        const el = document.getElementById(`${pt.card}-countdown`);
        if (el) el.textContent = formatDiff(diff);
      });
      // Update top bar
      if (nextPrayer) {
        document.getElementById('next-prayer-name').textContent = `${nextPrayer.ar} / ${nextPrayer.key}`;
        document.getElementById('next-prayer-countdown').textContent = formatDiff(nextPrayer.time - now);
      } else {
        document.getElementById('next-prayer-name').textContent = '--';
        document.getElementById('next-prayer-countdown').textContent = '--:--:--';
      }
    }
    function formatDiff(ms) {
      if (ms <= 0) return '00:00:00';
      const total = Math.floor(ms / 1000);
      const h = String(Math.floor(total / 3600)).padStart(2, '0');
      const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
      const s = String(total % 60).padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    updateAll();
    setInterval(updateAll, 1000);
  }

  // --- Adhan Notification Toggle ---
  function getEnabledPrayers() {
    try {
      return JSON.parse(localStorage.getItem('enabledPrayers')) || {};
    } catch {
      return {};
    }
  }
  function setEnabledPrayers(obj) {
    localStorage.setItem('enabledPrayers', JSON.stringify(obj));
  }
  function updateAdhanButtons() {
    const enabled = getEnabledPrayers();
    document.querySelectorAll('.adhan-btn').forEach(btn => {
      const prayer = btn.getAttribute('data-prayer');
      if (enabled[prayer]) {
        btn.classList.add('active');
        btn.querySelector('.material-icons').textContent = 'notifications_active';
      } else {
        btn.classList.remove('active');
        btn.querySelector('.material-icons').textContent = 'notifications_off';
      }
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    updateAdhanButtons();
    document.querySelectorAll('.adhan-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prayer = btn.getAttribute('data-prayer');
        let enabled = getEnabledPrayers();
        enabled[prayer] = !enabled[prayer];
        setEnabledPrayers(enabled);
        updateAdhanButtons();
        if (enabled[prayer]) {
          if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
          }
        }
      });
    });
  });

  // --- Dark Mode ---
  // --- Dashboard Dark Mode (single implementation) ---
  (function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    // Set initial state from localStorage
    darkModeToggle.checked = localStorage.getItem('theme') === 'dark';
    function applyDashboardTheme(isDark) {
      if (isDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    }
    // On toggle
    darkModeToggle.addEventListener('change', () => {
      applyDashboardTheme(darkModeToggle.checked);
    });
    // Apply on load
    applyDashboardTheme(darkModeToggle.checked);
  })();


  // --- Qibla Compass ---
  function setupQiblaCompass() {
    const compass = document.getElementById('qibla-compass');
    if (!compass) return;
    // Makkah coordinates
    const MAKKAH_LAT = 21.4225, MAKKAH_LON = 39.8262;
    function bearingToQibla(lat, lon) {
      // Formula for initial bearing from current lat/lon to Makkah
      const φ1 = lat * Math.PI / 180;
      const φ2 = MAKKAH_LAT * Math.PI / 180;
      const Δλ = (MAKKAH_LON - lon) * Math.PI / 180;
      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
      let θ = Math.atan2(y, x);
      return (θ * 180 / Math.PI + 360) % 360;
    }
    function rotateCompass(bearing) {
      compass.style.transform = `rotate(${bearing}deg)`;
    }
    // Try to use device orientation if available
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', (event) => {
        if (event.absolute && event.alpha != null) {
          rotateCompass(event.alpha);
        }
      }, true);
    }
    // Fallback: static north or use geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        const bearing = bearingToQibla(lat, lon);
        rotateCompass(bearing);
      });
    } else {
      rotateCompass(0);
    }
  }

  // --- INIT ---
  setDates();
  fetchAndSetLocation();
  setupQiblaCompass();
  setInterval(setDates, 60 * 1000); // Update dates every minute

  // Button: Show Current Time & Next Prayer
  window.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('show-next-prayer');
    if (btn) {
      btn.addEventListener('click', function () {
        const now = getNow();
        const nextPrayer = getNextPrayer(now, prayerTimes);
        const nextPrayerTime = getNextPrayerTime(now, prayerTimes);
        alert(
          'Current time: ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + '\n' +
          'Next prayer: ' + nextPrayer + ' at ' + nextPrayerTime.getHours().toString().padStart(2, '0') + ':' + nextPrayerTime.getMinutes().toString().padStart(2, '0')
        );
      });
    }
  });
  // === End Prayer Dashboard Logic ===

  // Swiper for feature slider removed
  // Animation handled via CSS

  // Collapsible nav accordion logic for slide-menu
  const featuresToggle = document.getElementById('features-toggle');
  const exploreToggle = document.getElementById('explore-toggle');
  const featuresLinks = document.getElementById('features-links');
  const exploreLinks = document.getElementById('explore-links');

  function closeSection(toggleBtn, linksDiv) {
    if (toggleBtn && linksDiv) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      linksDiv.classList.add('collapsed');
    }
  }
  function openSection(toggleBtn, linksDiv) {
    if (toggleBtn && linksDiv) {
      toggleBtn.setAttribute('aria-expanded', 'true');
      linksDiv.classList.remove('collapsed');
    }
  }
  function toggleAccordion(clickedBtn, clickedLinks, otherBtn, otherLinks) {
    const isOpen = clickedBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeSection(clickedBtn, clickedLinks);
    } else {
      openSection(clickedBtn, clickedLinks);
      closeSection(otherBtn, otherLinks);
    }
  }
  if (featuresToggle && exploreToggle && featuresLinks && exploreLinks) {
    featuresToggle.addEventListener('click', function () {
      toggleAccordion(featuresToggle, featuresLinks, exploreToggle, exploreLinks);
    });
    exploreToggle.addEventListener('click', function () {
      toggleAccordion(exploreToggle, exploreLinks, featuresToggle, featuresLinks);
    });
  }


  // Three Dot Menu functionality
  const openMenuButton = document.getElementById('open-menu-button');
  const closeMenuButton = document.getElementById('close-menu-button');
  const slideMenu = document.getElementById('slide-menu');
  const backdrop = document.getElementById('backdrop');
  const body = document.body;

  applyTheme(savedTheme);

  // Open menu when three-dot button is clicked
  if (openMenuButton && slideMenu && backdrop) {
    openMenuButton.addEventListener('click', () => {
      slideMenu.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
  }

  // Close menu when close button is clicked
  if (closeMenuButton && slideMenu && backdrop) {
    closeMenuButton.addEventListener('click', () => {
      slideMenu.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
  }

  // Close menu when backdrop is clicked
  if (backdrop && slideMenu) {
    backdrop.addEventListener('click', () => {
      slideMenu.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
  }


  if (startBtn && resultDiv && submitBtn) {
    startBtn.onclick = async () => {
      if (!navigator.mediaDevices) {
        alert('Audio recording not supported!');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        audioBlob = null;
        if (recordingIndicator) recordingIndicator.style.display = 'inline-flex';
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = async () => {
          if (recordingIndicator) recordingIndicator.style.display = 'none';
          audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          console.log('Recording complete:', {
            size: audioBlob.size,
            type: audioBlob.type,
            chunks: audioChunks.length
          });
          resultDiv.textContent = 'Recording complete. Click Submit to search.';
        };
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
      } catch (err) {
        if (recordingIndicator) recordingIndicator.style.display = 'none';
        alert('Could not access microphone.');
      }
    };

    submitBtn.onclick = async () => {
      console.log('Submit button clicked');
      if (!audioBlob) {
        console.log('No audio blob found');
        resultDiv.textContent = 'Please record your voice first.';
        return;
      }
      console.log('Audio blob found:', {
        size: audioBlob.size,
        type: audioBlob.type
      });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      console.log('FormData created with audio');
      resultDiv.innerHTML = '<span class="spinner"></span> Processing...';
      resultDiv.classList.add('loading');
      try {
        console.log('Sending audio size:', audioBlob.size + ' bytes');
        console.log('Audio type:', audioBlob.type);
        console.log('Audio duration:', audioBlob.duration);

        const res = await fetch('https://anshaad007.app.n8n.cloud/webhook/quran-voice', {
          method: 'POST',
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        resultDiv.classList.remove('loading');
        if (data.ayah && data.translation) {
          resultDiv.innerHTML = `<b>${data.ayah}</b><br><i>${data.translation}</i>`;
        } else {
          resultDiv.textContent = 'No matching ayah found.';
        }
      } catch (err) {
        resultDiv.classList.remove('loading');
        resultDiv.textContent = 'Error processing audio.';
      }
    };
  }

  // Smooth scrolling for menu links
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - 70, // Adjust for fixed header
            behavior: 'smooth'
          });
          // Close menu after click
          slideMenu.classList.remove('active');
          backdrop.classList.remove('active');
          document.body.style.overflow = ''; // Restore scrolling
        }
      }
    });
  });

  // Verse of the Day - Daily Cycle
  const verses = [
    { text: "Indeed, with hardship will be ease.", source: "Quran 94:6" },
    { text: "So remember Me; I will remember you.", source: "Quran 2:152" },
    { text: "And He is with you wherever you are.", source: "Quran 57:4" },
    { text: "The remembrance of Allah is the greatest.", source: "Quran 29:45" },
    { text: "And seek help through patience and prayer.", source: "Quran 2:45" },
    { text: "And whoever relies upon Allah - then He is sufficient for him.", source: "Quran 65:3" },
    { text: "Do not despair of the mercy of Allah.", source: "Quran 39:53" },
    { text: "Verily, in the remembrance of Allah do hearts find rest.", source: "Quran 13:28" },
    { text: "Allah does not burden a soul beyond that it can bear.", source: "Quran 2:286" },
    { text: "And speak to people good [words].", source: "Quran 2:83" },
    { text: "The life of this world is but amusement and diversion.", source: "Quran 47:36" },
    { text: "And hold firmly to the rope of Allah all together and do not become divided.", source: "Quran 3:103" },
    { text: "Indeed, my Lord is the Hearer of supplication.", source: "Quran 14:39" },
    { text: "So verily, with the hardship, there is relief.", source: "Quran 94:5" },
    { text: "And be patient, for indeed, Allah does not allow to be lost the reward of the doers of good.", source: "Quran 11:115" },
    { text: "And it is He who created the night and day, and the sun and moon.", source: "Quran 21:33" },
    { text: "And to Allah belongs whatever is in the heavens and whatever is on the earth.", source: "Quran 3:109" },
    { text: "He knows what is within the heavens and earth and knows what you conceal and what you declare.", source: "Quran 64:4" },
    { text: "My Lord, increase me in knowledge.", source: "Quran 20:114" },
    { text: "And We created you in pairs.", source: "Quran 78:8" },
    { text: "So which of the favors of your Lord would you deny?", source: "Quran 55:13" },
    { text: "Indeed, Allah is with the patient.", source: "Quran 2:153" },
    { text: "And seek forgiveness of your Lord and repent to Him. Indeed, my Lord is Merciful and Affectionate.", source: "Quran 11:90" },
    { text: "If you are grateful, I will surely increase you [in favor].", source: "Quran 14:7" },
    { text: "And whoever fears Allah - He will make for him a way out.", source: "Quran 65:2" },
    { text: "Call upon Me; I will respond to you.", source: "Quran 40:60" },
    { text: "And say, 'My Lord, have mercy upon them as they brought me up [when I was] small.'", source: "Quran 17:24" },
    { text: "Every soul will taste death.", source: "Quran 3:185" },
    { text: "And do not walk upon the earth exultantly. Indeed, you will never tear the earth [apart], and you will never reach the mountains in height.", source: "Quran 17:37" },
    { text: "And the Hereafter is better for you than the first [life].", source: "Quran 93:4" }
  ];

  const verseElement = document.querySelector('.quran-verse p');
  const sourceElement = document.querySelector('.quran-verse footer');

  // Ensure a new verse on every open, no repeats until all are shown
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  let verseOrder = JSON.parse(localStorage.getItem('verseOrder') || 'null');
  let versePointer = parseInt(localStorage.getItem('versePointer') || '0', 10);
  if (!verseOrder || verseOrder.length !== verses.length) {
    verseOrder = Array.from({ length: verses.length }, (_, i) => i);
    shuffle(verseOrder);
    versePointer = 0;
  }
  const verseIndex = verseOrder[versePointer];
  const randomVerse = verses[verseIndex];
  versePointer = (versePointer + 1) % verses.length;
  if (versePointer === 0) {
    // Reshuffle for a new cycle
    shuffle(verseOrder);
  }
  localStorage.setItem('verseOrder', JSON.stringify(verseOrder));
  localStorage.setItem('versePointer', versePointer.toString());

  if (verseElement && sourceElement && randomVerse) {
    verseElement.textContent = `"${randomVerse.text}"`;
    sourceElement.textContent = `- ${randomVerse.source}`;
  }

  // Animate elements on scroll
  const animatedItems = document.querySelectorAll('.feature-item, .verse-of-the-day');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fadeInUp 1s ease-out forwards`;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animatedItems.forEach(item => {
    item.style.opacity = '0'; // Hide initially
    observer.observe(item);
  });

  // Ensure Swiper navigation buttons are visible and styled (JS fallback)
  document.querySelectorAll('.swiper-button-next, .swiper-button-prev').forEach(btn => {
    btn.style.color = '#333';
    btn.style.zIndex = '10';
    btn.style.display = 'block';
    btn.style.opacity = '1';
    btn.style.width = '44px';
    btn.style.height = '44px';
    btn.style.background = 'rgba(255,255,255,0.7)';
    btn.style.borderRadius = '50%';
    btn.style.top = '50%';
    btn.style.transform = 'translateY(-50%)';
  });

  // Initialize Feature Slider
  const featureSwiper = new Swiper('.feature-slider', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 50,
      },
    }
  });

  // ScrollReveal Animations
  const sr = ScrollReveal({
    origin: 'bottom',
    distance: '60px',
    duration: 1000,
    delay: 400,
    reset: false,
  });

  sr.reveal('section h2, .verse-of-the-day');
  sr.reveal('.feature-item', { interval: 200 });
  sr.reveal('.community-card', { interval: 200 });
});

// Add keyframes for the animation in CSS
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;
document.head.appendChild(styleSheet);