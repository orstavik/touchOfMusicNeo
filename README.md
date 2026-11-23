# Touch of Music

A browser instrument using the original piano samples and keyboard layout, rebuilt without Polymer. Play the on-screen keys or the matching physical keyboard keys. Hold Shift to sharpen a single note; enable chord mode to play diatonic chords on the bottom row. Choose a key, mode, and octave above the keyboard.

The original game visuals and practice scenario are not included in this standalone player. The old Polymer components remain in `elements/` for reference.

## Run locally

Serve the repository over HTTP, for example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The page and its sample URLs are relative, so it can also be hosted directly from the root of a GitHub Pages branch.
