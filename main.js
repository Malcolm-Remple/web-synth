const audioContext = new AudioContext();

// Create audio buffer
const buffer = audioContext.createBuffer(
  1, // Number of channels, 1 mono, 2 stereo, 6 5.1 surround.
  audioContext.sampleRate * 1, // The number of samples in the entire buffer, multiply by number of seconds in sample.
  audioContext.sampleRate, // Pass in the sample rate.
);

// Get first channel, indexed by 0.
const channelData = buffer.getChannelData(0);

// Mutate channelData to create a signal. Assign random value between -1 and 1 to create white noise.
for (let i = 0; i < buffer.length; i++) {
  channelData[i] = Math.random() * 2 - 1;
};

// Volume amount
let volumeAmount = 0.3;
const volumeSlider = (event) => {
  volumeAmount = event.target.value;
  volumeAmount = volumeAmount / 100;
}


// // Snare Drum
const playSnare = () => {
  // Create gain node to control audio volume.
  const primaryGainControl = audioContext.createGain();
  primaryGainControl.gain.setValueAtTime(volumeAmount, 0); // amount of gain, start time.
  primaryGainControl.connect(audioContext.destination);

  // Create highpass filter for snare.
  const snareFilter = audioContext.createBiquadFilter();
  snareFilter.type = "highpass";
  snareFilter.frequency.value = 3000; // Set frequency cutoff.
  snareFilter.connect(primaryGainControl); // Connect to gain control.

  // Create buffer source
  const whiteNoiseSource = audioContext.createBufferSource();
  whiteNoiseSource.buffer = buffer;

  // Create gain node for the snare.
  const whiteNoiseGain = audioContext.createGain();
  whiteNoiseGain.gain.setValueAtTime(1, audioContext.currentTime);
  whiteNoiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  whiteNoiseSource.connect(whiteNoiseGain);
  
  // Connect to snare filter.
  whiteNoiseGain.connect(snareFilter);
  
  // Call the start method.
  whiteNoiseSource.start();
  whiteNoiseSource.stop(audioContext.currentTime + 0.2); // Duration of note.
  
  // Create oscillator node for snare.
  const snareOscillator = audioContext.createOscillator();
  snareOscillator.type = "triangle" // Set waveform.
  snareOscillator.frequency.setValueAtTime(150, audioContext.currentTime) // Set frequency.
  
  // Create gain node for oscillator.
  const oscillatorGain = audioContext.createGain();
  oscillatorGain.gain.setValueAtTime(1.7, audioContext.currentTime); // Set gain.
  oscillatorGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  // Connect snare to gain
  snareOscillator.connect(oscillatorGain);
  oscillatorGain.connect(primaryGainControl);
  
  snareOscillator.start();
  snareOscillator.stop(audioContext.currentTime + 0.2);

};

// Play snare on click
const snareButton = document.getElementById('snare');
snareButton.addEventListener("click", () => {
  playSnare();
})


// Kick Drum
const playKick = () => {
  // Create gain node to control audio volume.
  const primaryGainControl = audioContext.createGain();
  primaryGainControl.gain.setValueAtTime(volumeAmount, 0); // amount of gain, start time.
  primaryGainControl.connect(audioContext.destination);

  // Create oscillator node.
  const kickOscillator = audioContext.createOscillator();

  // Set oscillator frequency.
  kickOscillator.frequency.setValueAtTime(250, 0);
  // kickOscillator.type = "square";
  kickOscillator.frequency.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5); // Ramp down

  // Create kick gain to remove click at end of sound.
  const kickGain = audioContext.createGain();
  kickGain.gain.setValueAtTime(7, 0);
  kickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5); // Fade down gain

  // Connect to kick gain.
  kickOscillator.connect(kickGain);
  kickGain.connect(primaryGainControl);

  // Start oscillator.
  kickOscillator.start();
  kickOscillator.stop(audioContext.currentTime + 0.5); // Duration of note.
};

// Play kick on click
const kickButton = document.getElementById('kick');
kickButton.addEventListener("click", () => {
  playKick();
})


// Hihat
const HIHAT_URL = "./hihat.mp3";

const playHitHat = async () => {
  // Create gain node to control audio volume.
  const primaryGainControl = audioContext.createGain();
  primaryGainControl.gain.setValueAtTime(volumeAmount, 0); // amount of gain, start time.
  primaryGainControl.connect(audioContext.destination);

  const response = await fetch(HIHAT_URL);

  // Process sound as array buffer
  const soundBuffer = await response.arrayBuffer();
  // Turn into audio buffer
  const hiHatBuffer = await audioContext.decodeAudioData(soundBuffer);

  // Create buffer source
  const hiHatSource = audioContext.createBufferSource();
  hiHatSource.buffer = hiHatBuffer;

  // Change playback speed
  hiHatSource.playbackRate.setValueAtTime(2, 0);

  hiHatSource.connect(primaryGainControl);
  hiHatSource.start();
}

// Play hihat on click
const hitHatButton = document.getElementById('hiHat');
hitHatButton.addEventListener("click", () => {
  playHitHat();  
});


// Keyboard
// Wave Select
let waveFormSelect = 'sine';
const handleSelectChange = (event) => {
  waveFormSelect = event.target.value;
}

// Vibrato amount
let vibratoAmount = 10;
const vibratoAmountSlider = (event) => {
  vibratoAmount = event.target.value;
}

// Vibrato speed
let vibratoSpeed = 10;
const vibratoSpeedSlider = (event) => {
  vibratoSpeed = event.target.value;
}

// Notes
const notes = [
  { name: "C4", frequency: 261.63, keyId: "a" },
  { name: "C#4", frequency: 277.18, keyId: "w" }, 
  { name: "D4", frequency: 293.66, keyId: "s" },
  { name: "D#4", frequency: 311.13, keyId: "e" },
  { name: "E4", frequency: 329.63, keyId: "d" },
  { name: "F4", frequency: 349.23, keyId: "f" },
  { name: "F#4", frequency: 369.99, keyId: "t" },
  { name: "G4", frequency: 392.00, keyId: "g" },
  { name: "G#4", frequency: 415.30, keyId: "y" },
  { name: "A4", frequency: 440.00, keyId: "h" },
  { name: "A#4", frequency: 466.16, keyId: "u" },
  { name: "B4", frequency: 493.88, keyId: "j" },
  { name: "C5", frequency: 523.25, keyId: "k" },
  { name: "C#5", frequency: 554.37, keyId: "o" },
  { name: "D5", frequency: 587.33, keyId: "l" },
  { name: "D#5", frequency: 622.25, keyId: "p" },
  { name: "E5", frequency: 659.26, keyId: ";" },
];

const playNote = (frequency, element) => {
   // Create gain node to control audio volume.
   const primaryGainControl = audioContext.createGain();
   primaryGainControl.gain.setValueAtTime(volumeAmount, 0); // amount of gain, start time.
   primaryGainControl.connect(audioContext.destination);

   const noteOscillator = audioContext.createOscillator(); // Create Oscillator
   noteOscillator.type = waveFormSelect // Choose waveform
   noteOscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // Set note

   // LFO low frequency oscillator for vibrato
   const vibrato = audioContext.createOscillator();
   vibrato.frequency.setValueAtTime(vibratoSpeed, 0); // Speed
   const vibratoGain = audioContext.createGain(); // Create vibrato gain node.
   vibratoGain.gain.setValueAtTime(vibratoAmount, 0); // Set Vibrato amount
   vibrato.connect(vibratoGain);

   vibratoGain.connect(noteOscillator.frequency);
   vibrato.start();

   // Envelope settings ADSR
   const attackTime = 0.2;
   const decayTime = 0.3;
   const sustainLevel = 0.7;
   const releaseTime = 0.2;

   const now = audioContext.currentTime;

   // Create gain node
   const noteGain = audioContext.createGain();

   noteGain.gain.setValueAtTime(0, 0); // Gain start value
   noteGain.gain.linearRampToValueAtTime(1, now + attackTime); // Gain ramp up attackTime
   noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime); // gain ramp down
   noteGain.gain.setValueAtTime(sustainLevel, now + 1 - releaseTime); // Gain at release
   noteGain.gain.linearRampToValueAtTime(0, now + 1); // End ramp back down to 0

   noteOscillator.connect(noteGain);
   noteGain.connect(primaryGainControl);

   element.classList.add('active');

   noteOscillator.start();
   noteOscillator.stop(now + 1); // Set note length

    // Remove active class after note is finished playing.
    setTimeout(() => {
      element.classList.remove('active');
    }, 400);
}

// Keyboard Loop over notes
notes.forEach(({name, frequency}) => {
  const noteButton = document.querySelector(`[data-note="${name}"]`);
  
  noteButton.addEventListener("click", () => {
    playNote(frequency, noteButton);
  });
});

// Keyboard key press
document.addEventListener("keydown", (event) => {

  // Notes
  notes.forEach(({name, frequency, keyId}) => {
    const noteButton = document.querySelector(`[data-note="${name}"]`);

    if (event.key === keyId) {
      playNote(frequency, noteButton);
    }
  });

  // Snare
  if (event.key === ',') {
    playSnare();  
  }

  // Kick
  if (event.key === '.') {
    playKick();  
  }

  // Hihat
  if (event.key === '/') {
    playHitHat();  
  }
});
