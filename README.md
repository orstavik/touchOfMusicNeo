# Touch of Music

A browser instrument using the original piano samples and keyboard layout, rebuilt without Polymer. Play the on-screen keys or the matching physical keyboard keys. Hold Shift to sharpen a single note; enable chord mode to play diatonic chords on the bottom row. Choose a key, mode, and octave above the keyboard.

The flower uses the original artwork: its petals show the notes in the selected scale, and its center shows the key and mode. With the page background focused, Tab and Enter move the key left and right around the circle of fifths; the backquote (`) and Backspace move between modes. The adjacent buttons do the same, and the shortcuts do not intercept keyboard navigation while a control is focused.

The original game visuals and practice scenario are not included in this standalone player. The old Polymer components remain in `elements/` for reference.

## Run locally

Serve the repository over HTTP, for example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The page and its sample URLs are relative, so it can also be hosted directly from the root of a GitHub Pages branch.
