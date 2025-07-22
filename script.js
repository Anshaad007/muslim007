document.addEventListener('DOMContentLoaded', function() {
    // Initialize Swiper for feature slider
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        loop: true,
        breakpoints: {
            700: {
                slidesPerView: 2,
                spaceBetween: 24
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 32
            }
        }
    }); // Animation handled via CSS

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
        featuresToggle.addEventListener('click', function() {
            toggleAccordion(featuresToggle, featuresLinks, exploreToggle, exploreLinks);
        });
        exploreToggle.addEventListener('click', function() {
            toggleAccordion(exploreToggle, exploreLinks, featuresToggle, featuresLinks);
        });
    }


    // Three Dot Menu functionality
    const openMenuButton = document.getElementById('open-menu-button');
    const closeMenuButton = document.getElementById('close-menu-button');
    const slideMenu = document.getElementById('slide-menu');
    const backdrop = document.getElementById('backdrop');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Dark Mode Logic
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Change to sun icon
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Change to moon icon
        }
    };

    const toggleTheme = () => {
        const currentTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    };

    darkModeToggle.addEventListener('click', toggleTheme);

    // Apply saved theme on initial load
    const savedTheme = localStorage.getItem('theme') || 'light';
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
        link.addEventListener('click', function(e) {
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
        verseOrder = Array.from({length: verses.length}, (_, i) => i);
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