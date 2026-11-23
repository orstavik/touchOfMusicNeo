const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const modes = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  minor: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

// Degrees and octave offsets are from maps/audio-set1.html.
const rows = [
  [["Q", 3, -1], ["W", 5, -1], ["E", 7, -1], ["R", 2, 0], ["T", 4, 0], ["Y", 5, 0], ["U", 7, 0], ["I", 2, 1], ["O", 4, 1], ["P", 6, 1], ["[", 1, 2], ["]", 3, 2]],
  [["A", 4, -1], ["S", 6, -1], ["D", 1, 0], ["F", 3, 0], ["G", 5, 0], ["H", 6, 0], ["J", 1, 1], ["K", 3, 1], ["L", 5, 1], [";", 7, 1], ["'", 2, 2]],
  [["Z", 5, -1], ["X", 7, -1], ["C", 2, 0], ["V", 4, 0], ["B", 6, 0], ["N", 1, 1], ["M", 3, 1], [",", 5, 1], [".", 7, 1, 3], ["/", 2, 1]]
];
const codes = { "[": "BracketLeft", "]": "BracketRight", ";": "Semicolon", "'": "Quote", ",": "Comma", ".": "Period", "/": "Slash" };
const keySelect = document.querySelector("#key");
const modeSelect = document.querySelector("#mode");
const octaveSelect = document.querySelector("#octave");
const chordCheckbox = document.querySelector("#chords");
const keyboard = document.querySelector("#keyboard");
const status = document.querySelector("#status");
const buttons = new Map();
const buffers = new Map();
let audioContext;

for (const [index, note] of notes.entries()) keySelect.add(new Option(note, index));
for (const mode of Object.keys(modes)) modeSelect.add(new Option(mode[0].toUpperCase() + mode.slice(1), mode));

function tonesFor(key, sharpen = false) {
  const [label, degree, octaveOffset, chordDegree] = key;
  const scale = modes[modeSelect.value];
  const root = Number(keySelect.value);
  const octave = Number(octaveSelect.value) + octaveOffset;
  const chord = chordCheckbox.checked && rows[2].includes(key);
  const first = (chord && chordDegree ? chordDegree : degree) - 1;
  return (chord ? [first, first + 2, first + 4] : [first]).map(position =>
    octave * 12 + root + scale[position % 7] + Math.floor(position / 7) * 12 + (!chord && sharpen ? 1 : 0)
  );
}

function sampleNumber(tone) {
  // The first sample is A0; the original player uses C0 = 0.
  return tone - 8;
}

function noteName(tone) {
  return `${notes[((tone % 12) + 12) % 12]}${Math.floor(tone / 12)}`;
}

function refresh() {
  const scale = modes[modeSelect.value];
  const root = Number(keySelect.value);
  document.querySelector("#scale").textContent = scale.map(note => notes[(note + root) % 12]).join("  ·  ");
  for (const [key, button] of buttons) {
    const tones = tonesFor(key);
    button.disabled = tones.some(tone => sampleNumber(tone) < 1 || sampleNumber(tone) > 88);
    button.querySelector("strong").textContent = tones.map(noteName).join(" ");
    button.setAttribute("aria-label", `${key[0]}: ${tones.map(noteName).join(", ")}${button.disabled ? ", outside piano range" : ""}`);
  }
}

for (const row of rows) {
  const rowElement = document.createElement("div");
  rowElement.className = "row";
  for (const key of row) {
    const button = document.createElement("button");
    button.className = "key";
    button.type = "button";
    const label = document.createElement("span");
    label.textContent = key[0];
    button.append(label, document.createElement("strong"));
    button.addEventListener("click", event => play(key, event.shiftKey));
    buttons.set(key, button);
    rowElement.append(button);
  }
  keyboard.append(rowElement);
}

for (const control of [keySelect, modeSelect, octaveSelect, chordCheckbox]) control.addEventListener("change", refresh);
refresh();

async function loadSample(number) {
  if (!buffers.has(number)) {
    const loading = fetch(`audio/tones/piano/${number}.mp3`)
      .then(response => {
        if (!response.ok) throw new Error(`Could not load piano sample ${number} (${response.status}).`);
        return response.arrayBuffer();
      })
      .then(data => audioContext.decodeAudioData(data));
    buffers.set(number, loading);
    loading.catch(() => buffers.delete(number));
  }
  return buffers.get(number);
}

async function play(key, sharpen = false) {
  const tones = tonesFor(key, sharpen);
  if (tones.some(tone => sampleNumber(tone) < 1 || sampleNumber(tone) > 88)) {
    status.textContent = "That note is outside the available piano range.";
    return;
  }
  try {
    audioContext ||= new AudioContext();
    const [, ...samples] = await Promise.all([
      audioContext.resume(),
      ...tones.map(tone => loadSample(sampleNumber(tone)))
    ]);
    for (const sample of samples) {
      const source = audioContext.createBufferSource();
      source.buffer = sample;
      source.connect(audioContext.destination);
      source.start();
    }
    status.textContent = `Playing ${tones.map(noteName).join(" · ")}`;
  } catch (error) {
    status.textContent = `Could not play the piano: ${error.message}`;
  }
}

document.addEventListener("keydown", event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
  const entry = [...buttons].find(([key]) => (codes[key[0]] || `Key${key[0]}`) === event.code);
  if (!entry || entry[1].disabled) return;
  event.preventDefault();
  entry[1].classList.add("active");
  play(entry[0], event.shiftKey);
});
document.addEventListener("keyup", event => {
  for (const [key, button] of buttons) {
    if ((codes[key[0]] || `Key${key[0]}`) === event.code) button.classList.remove("active");
  }
});
window.addEventListener("blur", () => {
  for (const button of buttons.values()) button.classList.remove("active");
});
