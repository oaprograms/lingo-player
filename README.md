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

## Prerequisites

- [WebChimera.js prerequisites](https://github.com/RSATom/WebChimera.js#build-prerequisites)

## Installation

- ``npm install``

## Contributing

Anyone is very welcome to contribute to this project. In case you are interested, contact me at ognjen.apic at gmail.com, or start an issue.

**Planned features in future (help is welcome):**

- Auto-download subtitles from OpenSubtitles
- Make Lingo Player homepage, video tutorial
- Support more subtitle formats (currently supports .srt and .sub)
- Auto-detect subtitle encoding (find a good library for this)
- Make OSX version
- Add more dictionary sources
- Lemmatization / stemming?
- Highlight frequent words?
- Translate app UI into several languages

## Screenshots

![Main screen](http://oaprograms.github.io/lingo-player/images/screenshots/1.png)
![Words dialog](http://oaprograms.github.io/lingo-player/images/screenshots/3.png)
![File dialog](http://oaprograms.github.io/lingo-player/images/screenshots/4.png)
![Main screen](http://oaprograms.github.io/lingo-player/images/screenshots/2.png)

## Licence

MIT