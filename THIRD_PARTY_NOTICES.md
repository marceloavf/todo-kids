# Third-party notices

The [project MIT license](LICENSE) covers the original Todo Kids code and documentation. The following materials come from other projects.

| Material | Source and use | License supplied |
| --- | --- | --- |
| Noto Emoji SVGs | The [Noto Emoji project](https://github.com/googlefonts/noto-emoji) provides the task, reward and avatar artwork. The [fetch script](scripts/fetch-emoji.ts) records the upstream tag and copies the selected SVGs. | [Google copyright notice](public/emoji/LICENSE) and [Apache License 2.0](public/licenses/Apache-2.0.txt) |
| Sound effects | Samples from Kenney's [Interface Sounds](https://kenney.nl/assets/interface-sounds) and [Music Jingles](https://kenney.nl/assets/music-jingles), converted to mono WAV for playback. The [sound map](src/lib/sound.ts) identifies the originals. | [Interface Sounds CC0 notice](public/sounds/LICENSE-kenney-interface-sounds.txt) and [Music Jingles CC0 notice](public/sounds/LICENSE-kenney-music-jingles.txt) |
| Nunito variable font | The Nunito Project Authors, distributed through Fontsource. The Latin and other subset files are bundled locally. | [SIL Open Font License 1.1](public/licenses/Nunito-OFL.txt) |
| Lucide interface icons | [Lucide](https://lucide.dev/) provides navigation and action icons. Its notice also credits the original Feather icons. | [Lucide and Feather license text](public/licenses/Lucide.txt) |

Vite copies the notices under `public/` into the static build. The build also writes bundled dependency notices to `licenses/dependencies.md`. The [lockfile](package-lock.json) records the resolved versions.
