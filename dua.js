// Static Dua List - No API, No Categories
const categoriesContainer = document.querySelector('.dua-categories');

const duas = [
  {
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahumma iftah li abwaba rahmatik',
    translation: 'O Allah, open the doors of Your mercy for me.',
    reference: '[Muslim]'
  },
  {
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Bismillah, tawakkaltu ‘ala Allah, wa la hawla wa la quwwata illa billah',
    translation: 'In the name of Allah, I place my trust in Allah, and there is no power nor might except with Allah.',
    reference: '[Abu Dawood, Tirmidhi]'
  },
  {
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ',
    transliteration: 'Allahumma antas-salaam wa minkas-salaam, tabaarakta yaa Dhal-Jalaali wal-Ikraam',
    translation: 'O Allah, You are peace and from You comes peace. Blessed are You, O Owner of majesty and honor.',
    reference: '[Muslim]'
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni ilma',
    translation: 'My Lord, increase me in knowledge.',
    reference: '[Quran 20:114]'
  },
  {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina adhaban-nar',
    translation: 'Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.',
    reference: '[Quran 2:201]'
  },
  {
    arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbi ighfir li waliwalidayya warhamhuma kama rabbayani sagheera',
    translation: 'My Lord, forgive me and my parents, and have mercy upon them as they brought me up [when I was] small.',
    reference: '[Quran 17:24]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ',
    transliteration: 'Allahumma inni as’aluka al-‘afwa wal-‘afiyah',
    translation: 'O Allah, I ask You for pardon and well-being.',
    reference: '[Tirmidhi]'
  },
  {
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    transliteration: 'Rabbi ishrah li sadri wa yassir li amri',
    translation: 'My Lord, expand for me my chest and ease my task for me.',
    reference: '[Quran 20:25-26]'
  },
  {
    arabic: 'اللَّهُمَّ اهْدِنَا فِيمَنْ هَدَيْتَ',
    transliteration: 'Allahumma ihdina fiman hadayt',
    translation: 'O Allah, guide us among those You have guided.',
    reference: '[Tirmidhi]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْهَمِّ وَالْحَزَنِ',
    transliteration: 'Allahumma inni a’udhu bika minal-hammi wal-hazan',
    translation: 'O Allah, I seek refuge in You from worry and grief.',
    reference: '[Bukhari]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلَاءِ وَدَرَكِ الشَّقَاءِ وَسُوءِ الْقَضَاءِ وَشَمَاتَةِ الْأَعْدَاءِ',
    transliteration: 'Allahumma inni a’udhu bika min jahdil-bala’, wa darkish-shaqa’, wa su’il-qada’, wa shamatatil-a’da’',
    translation: 'O Allah, I seek refuge in You from severe calamity, misery, a bad fate, and the gloating of enemies.',
    reference: '[Bukhari, Muslim]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ وَتَحَوُّلِ عَافِيَتِكَ وَفُجَاءَةِ نِقْمَتِكَ وَجَمِيعِ سَخَطِكَ',
    transliteration: 'Allahumma inni a’udhu bika min zawali ni’matika wa tahawwuli ‘afiyatika wa fuja’ati niqmatika wa jami’i sakhatika',
    translation: 'O Allah, I seek refuge in You from the loss of Your blessings, the change of the state of well-being, Your sudden punishment, and all Your displeasure.',
    reference: '[Muslim]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْكُفْرِ وَالْفَقْرِ وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ',
    transliteration: 'Allahumma inni a’udhu bika minal-kufri wal-faqri wa a’udhu bika min ‘adhabil-qabr',
    translation: 'O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave.',
    reference: '[Bukhari, Muslim]'
  },
  {
    arabic: 'رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَلْ لِي مِنْ لَدُنْكَ سُلْطَانًا نَصِيرًا',
    transliteration: 'Rabbi adkhilni mudkhala sidqin wa akhrijni mukhraja sidqin waj’al li min ladunka sultanan nasira',
    translation: 'My Lord, cause me to enter a sound entrance and to exit a sound exit and grant me from Yourself a supporting authority.',
    reference: '[Quran 17:80]'
  },
  {
    arabic: 'رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً',
    transliteration: 'Rabbi hab li min ladunka dhurriyyatan tayyibah',
    translation: 'My Lord, grant me from Yourself good offspring.',
    reference: '[Quran 3:38]'
  },
  {
    arabic: 'رَبِّ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ',
    transliteration: 'Rabbi ishfi, anta ash-shafi, la shifa’a illa shifa’uka',
    translation: 'My Lord, heal (me), for You are the Healer. There is no healing except Your healing.',
    reference: '[Bukhari, Muslim]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا عَمِلْتُ وَمِنْ شَرِّ مَا لَمْ أَعْمَلْ',
    transliteration: 'Allahumma inni a’udhu bika min sharri ma ‘amiltu wa min sharri ma lam a’mal',
    translation: 'O Allah, I seek refuge in You from the evil of what I have done and from the evil of what I have not done.',
    reference: '[Muslim]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
    transliteration: 'Allahumma inni as’aluka al-jannah wa a’udhu bika min an-nar',
    translation: 'O Allah, I ask You for Paradise and seek refuge in You from the Fire.',
    reference: '[Abu Dawood, Nasa’i]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْعَجْزِ وَالْكَسَلِ',
    transliteration: 'Allahumma inni a’udhu bika minal-‘ajzi wal-kasal',
    translation: 'O Allah, I seek refuge in You from incapacity and laziness.',
    reference: '[Bukhari, Muslim]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْبُخْلِ وَالْجُبْنِ',
    transliteration: 'Allahumma inni a’udhu bika minal-bukhli wal-jubn',
    translation: 'O Allah, I seek refuge in You from miserliness and cowardice.',
    reference: '[Bukhari, Muslim]'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
    transliteration: 'Allahumma inni a’udhu bika min ghalabatid-dayni wa qahrir-rijal',
    translation: 'O Allah, I seek refuge in You from being overcome by debt and overpowered by men.',
    reference: '[Bukhari]'
  }
];

document.addEventListener('DOMContentLoaded', function () {
  categoriesContainer.innerHTML = duas.map(dua => `
    <div class="dua-block">
      <div class="dua-ar">${dua.arabic}</div>
      <div class="dua-translit">${dua.transliteration}</div>
      <div class="dua-meaning">${dua.translation}</div>
      <div class="dua-ref">${dua.reference}</div>
    </div>
  `).join('');
});

const catDiv = document.createElement('div');
catDiv.className = 'dua-category';
const btn = document.createElement('button');
btn.className = 'category-toggle';
btn.textContent = cat.name;
const contentDiv = document.createElement('div');
contentDiv.className = 'category-content';
contentDiv.innerHTML = '';
btn.addEventListener('click', async function () {
  // Accordion toggle
  catDiv.classList.toggle('open');
  if (!catDiv.classList.contains('loaded') && catDiv.classList.contains('open')) {
    contentDiv.innerHTML = '<div class="loading">Loading duas...</div>';
    try {
      const duaRes = await fetch(`https://hisnulmuslim.vercel.app/api/categories/${cat.id}`);
      const duas = await duaRes.json();
      contentDiv.innerHTML = '';
      if (!duas.length) {
        contentDiv.innerHTML = '<div class="dua-block">No duas found in this category.</div>';
      }
      for (const dua of duas) {
        const duaBlock = document.createElement('div');
        duaBlock.className = 'dua-block';
        duaBlock.innerHTML = `
                <div class="dua-ar">${dua.arabic || ''}</div>
                <div class="dua-translit">${dua.transliteration || ''}</div>
                <div class="dua-meaning">${dua.translation || ''}</div>
                <div class="dua-ref">${dua.reference || ''}</div>
              `;
        contentDiv.appendChild(duaBlock);
      }
      catDiv.classList.add('loaded');
    } catch (err) {
      contentDiv.innerHTML = '<div class="dua-block">Failed to load duas.</div>';
    }
  }
});
catDiv.appendChild(btn);
catDiv.appendChild(contentDiv);
categoriesContainer.appendChild(catDiv);

const fallback = [
  {
    name: 'Dua for Entering Masjid',
    duas: [
      {
        arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        transliteration: 'Allahumma iftah li abwaba rahmatik',
        translation: 'O Allah, open the doors of Your mercy for me.',
        reference: '[Muslim]'
      }
    ]
  },
  {
    name: 'Dua for Leaving Home',
    duas: [
      {
        arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        transliteration: 'Bismillah, tawakkaltu ‘ala Allah, wa la hawla wa la quwwata illa billah',
        translation: 'In the name of Allah, I place my trust in Allah, and there is no power nor might except with Allah.',
        reference: '[Abu Dawood, Tirmidhi]'
      }
    ]
  },
  {
    name: 'Dua after Prayer',
    duas: [
      {
        arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ',
        transliteration: 'Allahumma antas-salaam wa minkas-salaam, tabaarakta yaa Dhal-Jalaali wal-Ikraam',
        translation: 'O Allah, You are peace and from You comes peace. Blessed are You, O Owner of majesty and honor.',
        reference: '[Muslim]'
      }
    ]
  }
];
categoriesContainer.innerHTML += fallback.map(cat => `
      <div class="dua-category open">
        <button class="category-toggle" disabled>${cat.name}</button>
        <div class="category-content">
          ${cat.duas.map(dua => `
            <div class="dua-block">
              <div class="dua-ar">${dua.arabic}</div>
              <div class="dua-translit">${dua.transliteration}</div>
              <div class="dua-meaning">${dua.translation}</div>
              <div class="dua-ref">${dua.reference}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');


document.addEventListener('DOMContentLoaded', fetchCategories);
