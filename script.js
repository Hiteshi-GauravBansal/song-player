const dropZone = document.getElementById('drop-zone');
const audioPlayer = document.getElementById('audio-player');
const lyricsList = document.getElementById('lyrics-list');

let lyrics = []; // Store parsed lyrics with timestamps

// Handle drag-and-drop events
dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');

  const files = event.dataTransfer.files;
  let audioFile = null;
  let lrcFile = null;

  // Identify audio and LRC files
  for (const file of files) {
    if (file.type.startsWith('audio/')) {
      audioFile = file;
    } else if (file.name.endsWith('.lrc')) {
      lrcFile = file;
    }
  }

  if (audioFile) {
    loadAudioFile(audioFile);
  } else {
    alert('Please drop an audio file.');
  }

  if (lrcFile) {
    loadLRCFile(lrcFile);
  } else {
    alert('Please drop an LRC file.');
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
