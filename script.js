const audioDropZone = document.getElementById('audio-drop-zone');
const lrcDropZone = document.getElementById('lrc-drop-zone');
const audioPlayer = document.getElementById('audio-player');
const audioFileName = document.getElementById('audio-file-name');
const lrcFileName = document.getElementById('lrc-file-name');
const hlsUrlInput = document.getElementById('hls-url');
const loadHlsButton = document.getElementById('load-hls');
const lyricsList = document.getElementById('lyrics-list');

let lyrics = []; // Store parsed lyrics with timestamps

// Common function to handle dragover
function handleDragOver(event) {
  event.preventDefault();
  event.target.classList.add('dragover');
}

// Common function to handle dragleave
function handleDragLeave(event) {
  event.target.classList.remove('dragover');
}

// Handle drop for audio files
audioDropZone.addEventListener('dragover', handleDragOver);
audioDropZone.addEventListener('dragleave', handleDragLeave);
audioDropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  audioDropZone.classList.remove('dragover');

  const audioFile = [...event.dataTransfer.files].find(file => file.type.startsWith('audio/'));
  if (audioFile) {
    audioFileName.textContent = `Selected: ${audioFile.name}`;
    loadAudioFile(audioFile);
  } else {
    alert('Please drop a valid audio file.');
  }
});

// Handle drop for LRC files
lrcDropZone.addEventListener('dragover', handleDragOver);
lrcDropZone.addEventListener('dragleave', handleDragLeave);
lrcDropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  lrcDropZone.classList.remove('dragover');

  const lrcFile = [...event.dataTransfer.files].find(file => file.name.endsWith('.lrc'));
  if (lrcFile) {
    lrcFileName.textContent = `Selected: ${lrcFile.name}`;
    loadLRCFile(lrcFile);
  } else {
    alert('Please drop a valid LRC file.');
  }
});

// Load audio file
function loadAudioFile(file) {
  const url = URL.createObjectURL(file);
  audioPlayer.src = url;
  audioPlayer.play();
}

// Load and parse LRC file
function loadLRCFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const lrcContent = event.target.result;
    parseLRC(lrcContent);
    displayLyrics();
  };
  reader.readAsText(file);
}

// Load HLS URL
loadHlsButton.addEventListener('click', () => {
  const hlsUrl = hlsUrlInput.value.trim();
  if (!hlsUrl) {
    alert('Please enter a valid HLS URL.');
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(hlsUrl);
    hls.attachMedia(audioPlayer);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      audioPlayer.play();
    });
    audioFileName.textContent = `Playing from HLS URL: ${hlsUrl}`;
  } else if (audioPlayer.canPlayType('application/vnd.apple.mpegurl')) {
    // For Safari or native HLS support
    audioPlayer.src = hlsUrl;
    audioPlayer.play();
    audioFileName.textContent = `Playing from HLS URL: ${hlsUrl}`;
  } else {
    alert('Your browser does not support HLS playback.');
  }
});

// Parse LRC content
function parseLRC(lrcContent) {
  lyrics = []; // Reset lyrics
  const lines = lrcContent.split('\n');
  lines.forEach(line => {
    const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.+)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();
      lyrics.push({ time, text });
    }
  });
}

// Display lyrics in the HTML
function displayLyrics() {
  lyricsList.innerHTML = ''; // Clear existing lyrics
  lyrics.forEach(lyric => {
    const li = document.createElement('li');
    li.textContent = lyric.text;
    lyricsList.appendChild(li);
  });
}

// Highlight current lyric
audioPlayer.addEventListener('timeupdate', () => {
  const currentTime = audioPlayer.currentTime;
  const activeIndex = lyrics.findIndex((lyric, index) => {
    const nextLyric = lyrics[index + 1];
    return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
  });

  if (activeIndex !== -1) {
    document.querySelectorAll('#lyrics-list li').forEach((li, index) => {
      li.classList.toggle('active', index === activeIndex);
    });
  }
});
