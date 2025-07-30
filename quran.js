// Quran Reader Interactive Logic using https://alquran.cloud/api
// Loads Surah list, displays Ayahs & translations, handles audio playback

// Motivational hadiths/virtues about Quran recitation
const MOTIVATION_MESSAGES = [
  "\u201CThe best of you are those who learn the Quran and teach it.\u201D<br><span class='motivation-ref'>[Bukhari]</span>",
  "\u201CWhoever recites a letter from the Book of Allah, he will receive one good deed as ten like it.\u201D<br><span class='motivation-ref'>[Tirmidhi]</span>",
  "\u201CQuran will come as an intercessor for its reciters on the Day of Resurrection.\u201D<br><span class='motivation-ref'>[Muslim]</span>",
  "\u201CRead the Quran, for it will come as an intercessor for its companions.\u201D<br><span class='motivation-ref'>[Muslim]</span>",
  "\u201CThe one who is proficient in the recitation of the Quran will be with the honorable and obedient scribes (angels).\u201D<br><span class='motivation-ref'>[Bukhari & Muslim]</span>",
  "\u201CHe who finds it hard (to recite Quran) will have a double reward.\u201D<br><span class='motivation-ref'>[Bukhari & Muslim]</span>",
  "\u201CThe hearts rust just as iron rusts, and their polish is the recitation of the Quran.\u201D<br><span class='motivation-ref'>[Bayhaqi]</span>",
  "\u201CIndeed, this Quran guides to that which is most just and right.\u201D<br><span class='motivation-ref'>[Quran 17:9]</span>",
  "\u201CWhoever reads the Quran and acts upon it, his parents will be crowned on the Day of Resurrection.\u201D<br><span class='motivation-ref'>[Abu Dawood]</span>",
  "\u201CThe Quran is a proof for you or against you.\u201D<br><span class='motivation-ref'>[Muslim]</span>"
];

function showRandomMotivation() {
  const msgEl = document.getElementById('motivation-message');
  if (msgEl) {
    const idx = Math.floor(Math.random() * MOTIVATION_MESSAGES.length);
    console.log('[Motivation] showRandomMotivation called, idx:', idx, MOTIVATION_MESSAGES[idx]);
    msgEl.innerHTML = MOTIVATION_MESSAGES[idx];
    msgEl.style.display = 'block';
  } else {
    console.log('[Motivation] #motivation-message element not found!');
  }
}

document.addEventListener('DOMContentLoaded', showRandomMotivation);

const surahListEl = document.getElementById('surah-list');
const ayahListEl = document.getElementById('ayah-list');
const surahNumberEl = document.getElementById('surah-number');
const surahArabicNameEl = document.getElementById('surah-arabic-name');
const surahEnglishNameEl = document.getElementById('surah-english-name');
const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');
const audioSurahName = document.getElementById('audio-surah-name');
const audioReciter = document.getElementById('audio-reciter');

const API_BASE = 'https://api.alquran.cloud/v1';
const RECITATION = 'ar.alafasy'; // Mishary Rashid Alafasy
let TRANSLATION = 'en.asad'; // Default translation

let surahs = [];
let currentSurah = 1;

// Handle translation dropdown
const translationSelect = document.getElementById('translation-select');
const translationIconBtn = document.getElementById('translation-icon-btn');

// Show/hide translation dropdown on icon click
if (translationIconBtn && translationSelect) {
  translationIconBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    // Position the dropdown below and centered to the icon
    const rect = translationIconBtn.getBoundingClientRect();
    translationSelect.style.display = translationSelect.style.display === 'none' ? 'block' : 'none';
    translationSelect.style.position = 'absolute';
    const dropdownWidth = translationSelect.offsetWidth || 180; // fallback width
    const centerLeft = rect.left + (rect.width / 2) - (dropdownWidth / 2);
    translationSelect.style.left = `${centerLeft}px`;
    translationSelect.style.top = `${rect.bottom + window.scrollY + 6}px`;
    translationSelect.focus();
  });
  // Hide dropdown if clicking outside
  document.addEventListener('click', function(e) {
    if (translationSelect.style.display === 'block' && !translationSelect.contains(e.target) && e.target !== translationIconBtn) {
      translationSelect.style.display = 'none';
    }
  });
  // Hide on change
  translationSelect.addEventListener('change', function() {
    translationSelect.style.display = 'none';
  });
}

async function populateTranslations() {
  if (!translationSelect) return;
  const res = await fetch('https://api.alquran.cloud/v1/edition/type/translation');
  const data = await res.json();
  const editions = data.data;
  translationSelect.innerHTML = '';
  editions.forEach(edition => {
    const option = document.createElement('option');
    option.value = edition.identifier;
    let label = '';
    if (edition.language && edition.englishName) {
      label = `${edition.language.toUpperCase()} - ${edition.englishName}`;
    } else if (edition.englishName) {
      label = edition.englishName;
    } else {
      label = edition.identifier;
    }
    option.textContent = label;
    translationSelect.appendChild(option);
  });
  // Default to en.asad if available
  if ([...translationSelect.options].some(opt => opt.value === 'en.asad')) {
    translationSelect.value = 'en.asad';
    TRANSLATION = 'en.asad';
  } else if (translationSelect.options.length > 0) {
    TRANSLATION = translationSelect.value;
  }
}

if (translationSelect) {
  translationSelect.addEventListener('change', function() {
    TRANSLATION = translationSelect.value;
    if (currentSurah) {
      selectSurah(currentSurah);
    }
  });
  populateTranslations();
}

// Fetch and render Surah list
async function loadSurahList() {
  const res = await fetch(`${API_BASE}/surah`);
  const data = await res.json();
  surahs = data.data;
  surahListEl.innerHTML = '';
  surahs.forEach(surah => {
    const li = document.createElement('li');
    li.textContent = `${surah.number}. ${surah.englishName}`;
    li.title = surah.englishNameTranslation;
    li.dataset.surah = surah.number;
    li.innerHTML = `<span class='surah-num'>${surah.number}</span> <span class='surah-arabic'>${surah.name}</span> <span class='surah-en'>${surah.englishName}</span>`;
    li.onclick = () => selectSurah(surah.number);
    if (surah.number === 1) li.classList.add('selected');
    surahListEl.appendChild(li);
  });
}

// Fetch and render Surah Ayahs
async function loadSurah(surahNum) {
  ayahListEl.innerHTML = '<div class="loading">Loading...</div>';
  let arAyahs = [];
  let enAyahs = [];
  const [arRes, enRes] = await Promise.all([
    fetch(`${API_BASE}/surah/${surahNum}/${RECITATION}`),
    fetch(`${API_BASE}/surah/${surahNum}/${TRANSLATION}`)
  ]);
  const arData = await arRes.json();
  const enData = await enRes.json();
  arAyahs = arData.data.ayahs;
  enAyahs = enData.data.ayahs;
  ayahListEl.innerHTML = '';
  // Load bookmarks from localStorage
  const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');

  // --- Daily Ayah Read Tracker ---
  const today = new Date().toISOString().slice(0,10);
  const readKey = 'quranReadAyahs_' + today;
  let readAyahs = JSON.parse(localStorage.getItem(readKey) || '[]');

  function updateDailyProgress() {
    const progressEl = document.getElementById('daily-progress');
    if (progressEl) {
      progressEl.innerHTML = `<span style='font-size:1.18em;color:#674636;font-weight:600;'>You’ve read <span style='color:#e0b84c;font-size:1.2em;'>${readAyahs.length}</span> Ayah${readAyahs.length===1?'':'s'} today. <span style='color:#aab396;'>Keep going!</span></span>`;
    }
  }

  // Done button logic (always up-to-date)
  const doneBtn = document.getElementById('done-reading-btn');
  const doneModal = document.getElementById('done-modal');
  const doneModalMsg = document.getElementById('done-modal-msg');
  const closeDoneModal = document.getElementById('close-done-modal');
  if (doneBtn && doneModal && doneModalMsg && closeDoneModal) {
    doneBtn.onclick = function() {
      let readAyahsNow = JSON.parse(localStorage.getItem(readKey) || '[]');
      const idx = Math.floor(Math.random() * MOTIVATION_MESSAGES.length);
      doneModalMsg.innerHTML = `You’ve read ${readAyahsNow.length} verse${readAyahsNow.length===1?'':'s'} today. Come back tomorrow!<br><br><span class='modal-motivation'>${MOTIVATION_MESSAGES[idx]}</span>`;
      doneModal.style.display = 'flex';
      showRandomMotivation();
    };
    closeDoneModal.onclick = function() {
      doneModal.style.display = 'none';
    };
    doneModal.onclick = function(e) {
      if (e.target === doneModal) doneModal.style.display = 'none';
    };
  }

  arAyahs.forEach((ayah, i) => {
    const enAyah = enAyahs[i];
    const isBookmarked = bookmarks.some(b => b.surah === surahNum && b.ayah === ayah.numberInSurah);
    const isRead = readAyahs.some(r => r.surah === surahNum && r.ayah === ayah.numberInSurah);
    const ayahDiv = document.createElement('div');
    ayahDiv.className = 'ayah-item' + (isRead ? ' ayah-read' : '');
    ayahDiv.innerHTML = `
      <div class='ayah-arabic'>${ayah.text} <span class='ayah-num'>(${ayah.numberInSurah})</span></div>
      <div class='ayah-translation'>${enAyah ? enAyah.text : ''}</div>
      <div class='ayah-actions'>
        <button class='icon-btn' title='Play Ayah' onclick='playAyahAudio(${JSON.stringify(ayah.audio)})'><i class="fas fa-play"></i></button>
        <button class='icon-btn bookmark-btn' title='Bookmark' data-surah='${surahNum}' data-ayah='${ayah.numberInSurah}'>
          <i class="fas fa-bookmark${isBookmarked ? ' bookmarked' : ''}"></i>
        </button>
        <button class='icon-btn check-btn' title='Mark as Read' data-surah='${surahNum}' data-ayah='${ayah.numberInSurah}'>
          <i class="fas fa-check-circle${isRead ? ' ayah-checked' : ''}"></i>
        </button>
      </div>
    `;
    ayahListEl.appendChild(ayahDiv);
  });
  updateDailyProgress();

  // Add event listeners for check buttons
  document.querySelectorAll('.check-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const surah = parseInt(this.getAttribute('data-surah'));
      const ayah = parseInt(this.getAttribute('data-ayah'));
      let readAyahs = JSON.parse(localStorage.getItem(readKey) || '[]');
      const idx = readAyahs.findIndex(r => r.surah === surah && r.ayah === ayah);
      if (idx > -1) {
        readAyahs.splice(idx, 1);
        this.querySelector('i').classList.remove('ayah-checked');
        this.closest('.ayah-item').classList.remove('ayah-read');
      } else {
        readAyahs.push({surah, ayah});
        this.querySelector('i').classList.add('ayah-checked');
        this.closest('.ayah-item').classList.add('ayah-read');
      }
      localStorage.setItem(readKey, JSON.stringify(readAyahs));
      updateDailyProgress();
    });
  });

  // Add event listeners for bookmark buttons
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const surah = parseInt(this.getAttribute('data-surah'));
      const ayah = parseInt(this.getAttribute('data-ayah'));
      let bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
      const idx = bookmarks.findIndex(b => b.surah === surah && b.ayah === ayah);
      if (idx > -1) {
        bookmarks.splice(idx, 1);
        this.querySelector('i').classList.remove('bookmarked');
      } else {
        bookmarks.push({surah, ayah});
        this.querySelector('i').classList.add('bookmarked');
      }
      localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
    });
  });
}

// Select and display a Surah
async function selectSurah(surahNum) {
  currentSurah = surahNum;
  document.querySelectorAll('.surah-list li').forEach(li => li.classList.remove('selected'));
  const selectedLi = document.querySelector(`.surah-list li[data-surah='${surahNum}']`);
  if (selectedLi) selectedLi.classList.add('selected');
  const surah = surahs.find(s => s.number === surahNum);
  surahNumberEl.textContent = surah.number;
  surahArabicNameEl.textContent = surah.name;
  surahEnglishNameEl.textContent = surah.englishName;
  audioSurahName.textContent = surah.englishName;
  await loadSurah(surahNum);
  // Set audio for full surah
  setSurahAudio(surahNum);
}

// Bookmark Modal Logic
const bookmarkModal = document.getElementById('bookmark-modal');
const openBookmarkModalBtn = document.getElementById('open-bookmark-modal');
const closeBookmarkModalBtn = document.getElementById('close-bookmark-modal');
const bookmarkListEl = document.getElementById('bookmark-list');
const bookmarkModalEmpty = document.querySelector('.bookmark-modal-empty');

function getBookmarks() {
  return JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
}
function setBookmarks(bookmarks) {
  localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
}
function renderBookmarkList() {
  const bookmarks = getBookmarks();
  bookmarkListEl.innerHTML = '';
  if (!bookmarks.length) {
    bookmarkModalEmpty.style.display = '';
    return;
  }
  bookmarkModalEmpty.style.display = 'none';
  bookmarks.forEach(b => {
    const surah = surahs.find(s => s.number === b.surah);
    const li = document.createElement('li');
    li.innerHTML = `<span class="bookmark-jump" data-surah="${b.surah}" data-ayah="${b.ayah}">
      <b>${surah ? surah.englishName : 'Surah ' + b.surah}</b> <span style='font-size:0.95em;'>(${b.surah}:${b.ayah})</span>
    </span>
    <button class="bookmark-remove-btn" title="Remove Bookmark" data-surah="${b.surah}" data-ayah="${b.ayah}">&times;</button>`;
    bookmarkListEl.appendChild(li);
  });
}
if (openBookmarkModalBtn && bookmarkModal) {
  openBookmarkModalBtn.addEventListener('click', function() {
    renderBookmarkList();
    bookmarkModal.style.display = 'flex';
  });
}
if (closeBookmarkModalBtn && bookmarkModal) {
  closeBookmarkModalBtn.addEventListener('click', function() {
    bookmarkModal.style.display = 'none';
  });
}
window.addEventListener('click', function(e) {
  if (bookmarkModal.style.display === 'flex' && e.target === bookmarkModal) {
    bookmarkModal.style.display = 'none';
  }
});
// Remove bookmark from modal
if (bookmarkListEl) {
  bookmarkListEl.addEventListener('click', function(e) {
    if (e.target.classList.contains('bookmark-remove-btn')) {
      const surah = parseInt(e.target.getAttribute('data-surah'));
      const ayah = parseInt(e.target.getAttribute('data-ayah'));
      let bookmarks = getBookmarks();
      bookmarks = bookmarks.filter(b => !(b.surah === surah && b.ayah === ayah));
      setBookmarks(bookmarks);
      renderBookmarkList();
      // Also update main view if current Surah
      if (surah === currentSurah) {
        document.querySelectorAll(`.bookmark-btn[data-surah='${surah}'][data-ayah='${ayah}'] i`).forEach(i => i.classList.remove('bookmarked'));
      }
    }
    // Jump to Ayah
    if (e.target.closest('.bookmark-jump')) {
      const jumpEl = e.target.closest('.bookmark-jump');
      const surah = parseInt(jumpEl.getAttribute('data-surah'));
      const ayah = parseInt(jumpEl.getAttribute('data-ayah'));
      selectSurah(surah);
      setTimeout(() => {
        const ayahEls = document.querySelectorAll('.ayah-item');
        const target = Array.from(ayahEls).find(div => {
          const btn = div.querySelector(`.bookmark-btn[data-surah='${surah}'][data-ayah='${ayah}']`);
          return btn;
        });
        if (target) {
          target.scrollIntoView({behavior:'smooth', block:'center'});
          target.classList.add('highlight-ayah');
          setTimeout(()=>target.classList.remove('highlight-ayah'), 1600);
        }
      }, 400);
      bookmarkModal.style.display = 'none';
    }
  });
}

// Set audio player for full Surah
async function setSurahAudio(surahNum) {
  // Use first ayah audio as fallback (API does not provide full surah audio for all reciters)
  const res = await fetch(`${API_BASE}/surah/${surahNum}/${RECITATION}`);
  const data = await res.json();
  if (data.data.ayahs && data.data.ayahs.length > 0) {
    audioSource.src = data.data.ayahs[0].audio;
    audioPlayer.load();
  }
  audioReciter.textContent = 'Mishary Rashid Alafasy';
}

// Play single Ayah audio
window.playAyahAudio = function (audioUrl) {
  audioSource.src = audioUrl;
  audioPlayer.load();
  audioPlayer.play();
}

// Init
loadSurahList().then(() => selectSurah(1));
