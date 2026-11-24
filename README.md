# Touch of Music

A browser instrument using the original piano samples and keyboard layout, rebuilt without Polymer. Play the on-screen keys or the matching physical keyboard keys. Hold Shift to sharpen a single note; enable chord mode to play diatonic chords on the bottom row. Choose a key, mode, and octave above the keyboard.

The flower uses the original artwork: its petals show the notes in the selected scale, and its center shows the key and mode. With the page background focused, Down/Up arrows or Tab/Å move the key down/up around the circle of fifths; Left/Right arrows or Caps Lock/Æ move the mode down/up. Enter also moves the key up, and the backquote (`) and Backspace move the mode down/up. Å and Æ use the characters reported by the keyboard layout, so they replace the corresponding note keys on a Norwegian keyboard. The adjacent buttons do the same, and the shortcuts do not intercept keyboard navigation while a control is focused. Hold Shift while playing a single note to sharpen it by one semitone.

The original game visuals and practice scenario are not included in this standalone player. The old Polymer components remain in `elements/` for reference.

## Run locally

Serve the repository over HTTP, for example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The page and its sample URLs are relative, so it can also be hosted directly from the root of a GitHub Pages branch.
