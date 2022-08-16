const audioContext = new AudioContext();

// Create audio buffer
const buffer = audioContext.createBuffer(
  1, // Number of channels, 1 mono, 2 stereo, 6 5.1 surround.
  audioContext.sampleRate * 1, // The number of samples in the entire buffer, mutply by number of seconds in sample.
  audioContext.sampleRate, // Pass in the sample rate.
);

// Get first channel, indexed by 0.
const channelData = buffer.getChannelData(0);

// Mutate channelData to create a signal. Assign random value between -1 and 1 to create white noise.
for (let i = 0; i < buffer.length; i++) {
  channelData[i] = Math.random() * 2 - 1;
};

// Volume amount
let volumeAmount = 0.5;
const volumeSlider = (event) => {
  volumeAmount = event.target.value;
  volumeAmount = volumeAmount / 100;
  console.log(volumeAmount);
}

// Create gain node to control audio volume.
const primaryGainControl = audioContext.createGain();
primaryGainControl.gain.setValueAtTime(volumeAmount, 0); // amount of gain, start time.
primaryGainControl.connect(audioContext.destination);

// Create highpass filter for snare.
const snareFilter = audioContext.createBiquadFilter();
snareFilter.type = "highpass";
snareFilter.frequency.value = 3000; // Set frequency cutoff.
snareFilter.connect(primaryGainControl); // Connect to gain control.


// // Snare Drum
const snareButton = document.getElementById('snare');
snareButton.addEventListener("click", () => {
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
})

// Kick Drum
const kickButton = document.getElementById('kick');
kickButton.addEventListener("click", () => {
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
})


// Hi Hat sample
const HIHAT_URL = "./hihat.mp3";
const hitHatButton = document.getElementById('hiHat');
hitHatButton.addEventListener("click", async () => {
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
});


// Keyboard
// Wave Select
let waveFormSelect = 'sine';
const handleSelectChange = (event) => {
  waveFormSelect = event.target.value;
}

// Vibrato amount
let vibratoAmount = 5;
const vibratoSlider = (event) => {
  vibratoAmount = event.target.value;
}

const notes = [
  { name: "C4", frequency: 261.63 },
  { name: "C#4", frequency: 277.18 },
  { name: "D4", frequency: 293.66 },
  { name: "D#4", frequency: 311.13 },
  { name: "E4", frequency: 329.63 },
  { name: "F4", frequency: 349.23 },
  { name: "F#4", frequency: 369.99 },
  { name: "G4", frequency: 392.00 },
  { name: "G#4", frequency: 415.30 },
  { name: "A4", frequency: 440.00 },
  { name: "A#4", frequency: 466.16 },
  { name: "B4", frequency: 493.88 },
  { name: "C5", frequency: 523.25 },
  { name: "C#5", frequency: 554.37 },
  { name: "D5", frequency: 587.33 },
  { name: "D#5", frequency: 622.25 },
  { name: "E5", frequency: 659.26 },
];

// Loop over notes
notes.forEach(({name, frequency}) => {
  const noteButton = document.querySelector(`[data-note="${name}"]`);
  noteButton.addEventListener("click", () => {
    const noteOscillator = audioContext.createOscillator(); // Create Oscillator
    noteOscillator.type = waveFormSelect // Choose waveform
    noteOscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // Set note

    // LFO low frequency oscillator for vibrato
    const vibrato = audioContext.createOscillator();
    vibrato.frequency.setValueAtTime(10, 0);
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

    noteOscillator.start();
    noteOscillator.stop(audioContext.currentTime + 1); // Set note length
  });
});
