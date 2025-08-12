const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendBtn');
const audioPlayer = document.getElementById('audioPlayer');
const audioPreview = document.querySelector('.audio-preview');
const outputDiv = document.querySelector('.output');
const outputText = document.getElementById('outputText');
const errorBox = document.getElementById('errorBox');

let mediaRecorder;
let audioChunks = [];
let audioUrl = null;

function showEl(el) {
  el.classList.remove('hidden');
  el.style.display = '';
}
function hideEl(el) {
  el.classList.add('hidden');
  el.style.display = 'none';
}

startBtn.onclick = async () => {
  hideEl(errorBox);
  hideEl(outputDiv);
  hideEl(audioPreview);
  audioPlayer.src = '';
  audioUrl = null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      audioUrl = URL.createObjectURL(blob);
      audioPlayer.src = audioUrl;
      audioPreview.style.display = '';
    };
    mediaRecorder.start();
    hideEl(startBtn);
    showEl(stopBtn);
  } catch (err) {
    errorBox.textContent = 'Microphone access denied or not available.';
    showEl(errorBox);
  }
};

stopBtn.onclick = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    hideEl(stopBtn);
    showEl(startBtn);
  }
};

sendBtn.onclick = async () => {
  hideEl(errorBox);
  hideEl(outputDiv);
  outputText.textContent = '';
  if (!audioUrl) return;
  sendBtn.disabled = true;
  sendBtn.textContent = 'Processing...';
  try {
    const blob = await fetch(audioUrl).then(r => r.blob());
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    const response = await fetch('https://anshaad0007.app.n8n.cloud/webhook/voice-upload', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to get tafsir.');
    const data = await response.json();
    // Handle n8n output: { output: '```json\n{...}\n```' }
    let tafsirData = null;
    if (data.output) {
      // Remove code block formatting
      let jsonStr = data.output.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
      }
      try {
        tafsirData = JSON.parse(jsonStr);
      } catch (e) {
        tafsirData = null;
      }
    }
    if (tafsirData && (tafsirData.tafsir || tafsirData['tafsir in malayalam'] || tafsirData.tafsir_english || tafsirData.tafsir_malayalam)) {
      outputText.innerHTML =
        `<strong>Surah:</strong> ${tafsirData.surah || ''}<br>` +
        `<strong>Ayah:</strong> ${tafsirData.ayah_number || tafsirData.ayah || ''}<br>` +
        (tafsirData.ayah_arabic ? `<strong>Ayah (Arabic):</strong> ${tafsirData.ayah_arabic}<br>` : (tafsirData['Ayah in arabic text'] ? `<strong>Ayah (Arabic):</strong> ${tafsirData['Ayah in arabic text']}<br>` : '')) +
        (tafsirData.tafsir_english ? `<br><strong>Tafsir (English):</strong> ${tafsirData.tafsir_english}` : (tafsirData.tafsir ? `<br><strong>Tafsir (English):</strong> ${tafsirData.tafsir}` : '')) +
        (tafsirData.tafsir_malayalam ? `<br><br><strong>Tafsir (Malayalam):</strong> ${tafsirData.tafsir_malayalam}` : (tafsirData['tafsir in malayalam'] ? `<br><br><strong>Tafsir (Malayalam):</strong> ${tafsirData['tafsir in malayalam']}` : ''));
    } else {
      outputText.textContent = 'No tafsir found.';
    }
    showEl(outputDiv);
  } catch (err) {
    errorBox.textContent = 'Error sending audio or receiving tafsir.';
    showEl(errorBox);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Get Tafsir';
  }
};
