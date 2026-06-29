## Description

Open source, cross-platform video player with language learning features.

- Based on VLC player, offers dictionary lookup for subtitles, word pronunciation and word saving features
- Works with 90 languages (8100 language combinations!), since it's using Google Translate

To download Windows release go here: http://oaprograms.github.io/lingo-player

**How it works:**

Let's say you are learning Spanish:

- Open a Spanish movie, with Spanish subtitles, and optionally 2nd subtitles in your language.
- Hover over any word to see translations to your language, click on it hear it and to save it to dictionary.
- You can mark words with 4 levels of familiarity (New - red, Recognized - orange, Familiar - yellow and Known - green)
- You can look up list of saved words any time and read subtitles in subtitle listing mode.

## Used Technologies

- NW.js (http://nwjs.io/)
- AngularJS (https://angularjs.org/)
- WebChimera.js (http://www.webchimera.org/)
- VLC player (http://www.videolan.org/vlc/index.html)
- NeDB (https://github.com/louischatriot/nedb)
- Google Translate (https://translate.google.com/)

## Running locally (Windows)

Requirements: [Node.js](https://nodejs.org/) and PowerShell (built into Windows).

```powershell
.\setup.ps1   # one-time: installs deps + NW.js 0.12.3 runtime + WebChimera/VLC
.\run.ps1     # launches the app
```

`setup.ps1` is idempotent — re-run it any time. Everything it downloads
(the `.nwjs` runtime, `node_modules`) is git-ignored and self-contained in the
repo, so there are no machine-specific paths to configure.

Notes:
- The app pins old, consistent versions (NW.js 0.12.3, WebChimera VLC binding,
  and a few transitive deps) because it predates modern Node/Chromium.

## Building a portable release (Windows)

After `setup.ps1`, build a self-contained, no-install folder + zip:

```powershell
.\build-portable.ps1
```

Output goes to `.\dist\` (git-ignored):
- `dist\Lingo Player\` — run **`LingoPlayer.exe`** from anywhere, on a clean
  Win10/11 with nothing installed (bundles Chromium, VLC, and the VC++ 2013 runtime).
- `dist\Lingo Player Portable.zip` — the distributable.

The launcher is renamed `nw.exe` → `LingoPlayer.exe` by patching the WebChimera
native module's hard-coded host name (`tools/patch-nw-name.js`) — a plain rename
would break native-module loading. The folder is the deliverable: NW.js native
modules require the host to keep a fixed name, so this can't be a single bare .exe.

**Planned features in future (help is welcome):**

- Make OSX version
- Add more dictionary sources
- Lemmatization / stemming?
- Highlight frequent words?
- Translate app UI into several languages

## Screenshots

![Main screen](http://oaprograms.github.io/lingo-player/images/screenshots/2.png)
![Words dialog](http://oaprograms.github.io/lingo-player/images/screenshots/1.png)
![File dialog](http://oaprograms.github.io/lingo-player/images/screenshots/3.png)
![Main screen](http://oaprograms.github.io/lingo-player/images/screenshots/5.png)

## Licence

MIT