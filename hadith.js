// Static Random Hadith Display (No API)
const hadithResult = document.getElementById('hadithResult');

const hadiths = [
  {
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
    translation: 'Actions are judged by intentions.',
    number: 'Bukhari 1'
  },
  {
    arabic: 'مَنْ حَسَّنَ إِسْلَامَهُ كُفِّرَ عَنْهُ سَيِّئَاتُهُ',
    translation: 'Whoever perfects his Islam, his bad deeds will be wiped out.',
    number: 'Bukhari 41'
  },
  {
    arabic: 'لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    translation: 'None of you truly believes until he loves for his brother what he loves for himself.',
    number: 'Bukhari 13'
  },
  {
    arabic: 'الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ',
    translation: 'The world is a prison for the believer and a paradise for the disbeliever.',
    number: 'Muslim 2956'
  },
  {
    arabic: 'مَنْ صَمَتَ نَجَا',
    translation: 'Whoever is silent is saved.',
    number: 'Tirmidhi 2501'
  },
  {
    arabic: 'الدِّينُ يُسْرٌ',
    translation: 'The religion is easy.',
    number: 'Bukhari 39'
  },
  {
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    translation: 'A Muslim is the one from whose tongue and hand the Muslims are safe.',
    number: 'Bukhari 10'
  },
  {
    arabic: 'مَنْ لا يَرْحَمْ لا يُرْحَمْ',
    translation: 'He who does not show mercy will not be shown mercy.',
    number: 'Bukhari 6013'
  },
  {
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    translation: 'Purity is half of faith.',
    number: 'Muslim 223'
  },
  {
    arabic: 'مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ',
    translation: 'Whoever guides someone to goodness will have a reward like one who did it.',
    number: 'Muslim 1893'
  },
  {
    arabic: 'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ',
    translation: 'Allah is beautiful and loves beauty.',
    number: 'Muslim 91'
  },
  {
    arabic: 'إِذَا لَمْ تَسْتَحِ فَاصْنَعْ مَا شِئْتَ',
    translation: 'If you feel no shame, do as you wish.',
    number: 'Bukhari 3483'
  },
  {
    arabic: 'مَنْ غَشَّنَا فَلَيْسَ مِنَّا',
    translation: 'Whoever cheats us is not one of us.',
    number: 'Muslim 102'
  },
  {
    arabic: 'الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى',
    translation: 'The upper hand is better than the lower hand.',
    number: 'Bukhari 1429'
  },
  {
    arabic: 'مَنْ لا يَشْكُرِ النَّاسَ لا يَشْكُرِ اللَّهَ',
    translation: 'He who does not thank people does not thank Allah.',
    number: 'Tirmidhi 1954'
  },
  {
    arabic: 'مَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالآخِرَةِ',
    translation: 'Whoever conceals (the faults of) a Muslim, Allah will conceal him in this world and the Hereafter.',
    number: 'Muslim 2699'
  },
  {
    arabic: 'إِنَّ أَحَبَّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    translation: 'The most beloved deeds to Allah are those that are most consistent, even if few.',
    number: 'Bukhari 6464'
  },
  {
    arabic: 'إِنَّ الْبِرَّ حُسْنُ الْخُلُقِ',
    translation: 'Righteousness is good character.',
    number: 'Muslim 2553'
  },
  {
    arabic: 'لاَ ضَرَرَ وَلاَ ضِرَارَ',
    translation: 'There should be neither harming nor reciprocating harm.',
    number: 'Ibn Majah 2340'
  },
  {
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    translation: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    number: 'Bukhari 6018'
  },
  {
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    translation: 'Supplication is worship.',
    number: 'Tirmidhi 2969'
  },
  {
    arabic: 'مَنْ صَنَعَ إِلَيْكُمْ مَعْرُوفًا فَكَافِئُوهُ',
    translation: 'If someone does you a kindness, repay him.',
    number: 'Abu Dawood 1672'
  },
  {
    arabic: 'الْمُؤْمِنُ مِرْآةُ الْمُؤْمِنِ',
    translation: 'The believer is the mirror of the believer.',
    number: 'Abu Dawood 4918'
  },
  {
    arabic: 'مَنْ تَرَكَ الْمِرَاءَ وَهُوَ مُحِقٌّ بَنَى اللَّهُ لَهُ بَيْتًا فِي رَبَضِ الْجَنَّةِ',
    translation: 'Whoever gives up arguing while he is right will have a house built for him in the outskirts of Paradise.',
    number: 'Tirmidhi 1993'
  },
  {
    arabic: 'إِنَّ أَصْدَقَ الْحَدِيثِ كِتَابُ اللَّهِ',
    translation: 'The truest word is the Book of Allah.',
    number: 'Bukhari 6094'
  },
  {
    arabic: 'مَنْ أَشَارَ إِلَى أَخِيهِ بِحَدِيدَةٍ فَإِنَّ الْمَلَائِكَةَ تَلْعَنُهُ',
    translation: 'Whoever points a weapon at his brother, the angels curse him.',
    number: 'Muslim 2616'
  },
  {
    arabic: 'إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ',
    translation: 'Allah has prescribed excellence in everything.',
    number: 'Muslim 1955'
  },
  {
    arabic: 'مَنْ لا يُؤَدِّ الْأَمَانَةَ لَيْسَ مِنَّا',
    translation: 'He who does not fulfill trusts is not one of us.',
    number: 'Ahmad 12345'
  },
  {
    arabic: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
    translation: 'A believer to another believer is like a building whose different parts enforce each other.',
    number: 'Bukhari 481'
  },
  {
    arabic: 'إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ',
    translation: 'Each of you is collected in the womb of his mother for forty days.',
    number: 'Bukhari 3208'
  },
  {
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever follows a path seeking knowledge, Allah will make a path to Paradise easy for him.',
    number: 'Muslim 2699'
  },
  {
    arabic: 'إِنَّ اللَّهَ لا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    translation: 'Allah does not look at your appearance or wealth but at your hearts and deeds.',
    number: 'Muslim 2564'
  },
  {
    arabic: 'مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ وَيُنْسَأَ لَهُ فِي أَثَرِهِ فَلْيَصِلْ رَحِمَهُ',
    translation: 'Whoever wants his provision to be increased and his life to be extended, let him uphold his ties of kinship.',
    number: 'Bukhari 2067'
  }
];

function renderHadith(hadith) {
  hadithResult.innerHTML = `
    <div class="hadith-text">${hadith.arabic}</div>
    <div class="hadith-meaning">${hadith.translation}</div>
    <div class="hadith-ref">${hadith.reference}</div>
  `;
}

function showRandomHadith() {
  const idx = Math.floor(Math.random() * hadiths.length);
  renderHadith(hadiths[idx]);
}

// Add a button for another random hadith
let randomBtn = document.getElementById('randomHadithBtn');
if (!randomBtn) {
  randomBtn = document.createElement('button');
  randomBtn.id = 'randomHadithBtn';
  randomBtn.textContent = 'Show Another Hadith';
  randomBtn.className = 'random-hadith-btn';
  hadithResult.parentNode.insertBefore(randomBtn, hadithResult.nextSibling);
}
randomBtn.onclick = showRandomHadith;

document.addEventListener('DOMContentLoaded', showRandomHadith);
