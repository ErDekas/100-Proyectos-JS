const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const volumeControl = document.getElementById('volume');
const loopControl = document.getElementById('loop');
const shuffleControl = document.getElementById('shuffle');
const songName = document.getElementById('song-name');
const songArtist = document.getElementById('song-artist');

const songs = [
  { name: "Subaru's Ringtone", artist: "RE:Zero", file: "assets/cancion1.mp3" },
  { name: "Gemidos", artist: "Tortuga", file: "assets/cancion2.mp3" },
  { name: "Number One", artist: "Bleach", file: "assets/cancion3.mp3" }
];

let currentSongIndex = 0;
let isShuffle = false; // Para controlar el modo aleatorio

function loadSong(song) {
  songName.textContent = song.name;
  songArtist.textContent = song.artist;
  audio.src = song.file;
}

function playPauseSong() {
  if (audio.paused) {
    audio.play();
    playBtn.innerHTML = "&vert; &vert;"; // Pausa (⏸)
  } else {
    audio.pause();
    playBtn.innerHTML = "&#9654;"; // Play (►)
  }
}

function updateProgressBar() {
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
}

function changeSong() {
  loadSong(songs[currentSongIndex]);
  audio.play();
  playBtn.innerHTML = "&vert; &vert;"; // Pausa (⏸)
}

function nextSong() {
  if (isShuffle) {
    // Si estamos en modo aleatorio, seleccionamos una canción aleatoria
    currentSongIndex = Math.floor(Math.random() * songs.length);
  } else {
    // Si no, avanzamos a la siguiente canción de manera secuencial
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  changeSong();
}

function prevSong() {
  currentSongIndex = (currentSongIndex === 0) ? songs.length - 1 : currentSongIndex - 1;
  changeSong();
}

audio.addEventListener('ended', nextSong);  // Avanzar a la siguiente canción cuando termine

playBtn.addEventListener('click', playPauseSong);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

volumeControl.addEventListener('input', () => {
  audio.volume = volumeControl.value;
});

loopControl.addEventListener('change', () => {
  audio.loop = loopControl.checked;
});

shuffleControl.addEventListener('change', () => {
  isShuffle = shuffleControl.checked;
  if (isShuffle) {
    // Cambiar a una canción aleatoria inmediatamente si está activado
    currentSongIndex = Math.floor(Math.random() * songs.length);
    changeSong();
  }
});

audio.addEventListener('timeupdate', updateProgressBar);

progressBar.addEventListener('input', () => {
  const seekTime = (progressBar.value / 100) * audio.duration;
  audio.currentTime = seekTime;
});


document.addEventListener('keydown', function(event){
    if(event.code == 'Space'){
        playPauseSong();
    }
})


// Cargar la primera canción inicialmente
loadSong(songs[currentSongIndex]);
