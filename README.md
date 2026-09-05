<h1>
  <img src="assets/icon.png" alt="" width="72" height="72" align="absmiddle">
  Ruri
</h1>

A refined desktop canvas for music, with frosted-glass chrome and a plugin gallery. An independent open-source client for YouTube Music, built on [Pear Desktop](https://github.com/pear-devs/pear-desktop) (MIT).

<p align="center">
  <img src="web/player2.png" alt="Ruri home with frosted chrome and album-art backdrop" width="920">
</p>

| | |
| --- | --- |
| Product | Ruri **0.1.0** |
| License | [MIT](license) — see [NOTICE](NOTICE) |
| App id | `dev.ruri.desktop` |
| Protocol | `ruri:` |
| Window | 1600×900 default, 1100×620 min (disable min under Options → Advanced) |
| Forked from | pear-devs/pear-desktop 3.12.0 |

## Overview

Ruri is a native-feeling desktop shell around the music player: frosted chrome, an album-driven backdrop, and plugins you can toggle without leaving the window. Album art sets the color and the blur; the chrome stays out of the way.

- **Glass chrome** — translucent nav, search, menus, and player bar
- **Backdrop blur** — live color and blur from the album that’s playing
- **Custom lyrics** — synced lines on the now-playing canvas, including fullscreen
- **Adblock** — tracker blocking on by default (Do Not Track)
- **Plugin gallery** — visualizers, output device, and more, from the in-app menu
- **`ruri://` protocol** — play, pause, skip, and seek from shortcuts, scripts, or a Stream Deck

## Look

Glass is on by default. Windows and Linux use the in-app titlebar; macOS keeps native traffic lights.

More screenshots: [now playing](web/player1.png) · [queue](web/player2.png) · [fullscreen lyrics](web/fullscreen+lyrics.png) · [plugin gallery](web/plugins_menu.png)

Default-on: **Glassy Theme**, **Glassy Backdrop**, **Album Color Theme**, **Synced Lyrics**, **Do Not Track** (adblock).

> [!NOTE]
> Do not enable Glassy Theme together with Blur Navigation Bar (double blur). Turn off Transparent Player while Glassy Backdrop is on.

## Install

Unsigned builds. GitHub Actions packages Linux, Windows, and macOS when you push a `v*` tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

That runs [Release](.github/workflows/release.yml) and attaches files to the GitHub Release. You can also run the workflow by hand from the Actions tab (artifacts only, no Release).

| Platform | Artifact |
| --- | --- |
| Linux x64 | `Ruri-*.AppImage`, `ruri-*.tar.gz`, `ruri_*_amd64.deb` |
| Windows x64 | `Ruri *.exe` (portable) and `Ruri Setup *.exe` (NSIS) |
| macOS | `Ruri-*-mac.zip` / `.dmg` (x64 and arm64) |

```bash
chmod +x Ruri-0.1.0.AppImage
./Ruri-0.1.0.AppImage
```

Local packaging: `pnpm build` then `pnpm exec electron-builder --linux AppImage:x64 tar.gz:x64 -p never`. Output: `pack/`.

This repository stays MIT. Do not vendor GPL-3.0 code (Better Lyrics, Glassy Music Merge Theme, or related extensions).

## Protocol

The packaged app registers `ruri://`:

```
ruri://play
ruri://pause
ruri://playPause
ruri://next
ruri://previous
ruri://like
ruri://seekTo%2030
```

Arguments are separated by an encoded space (`%20`).

Linux: `xdg-open 'ruri://playPause'`. Do not use Pear’s `youtubemusic:` scheme.

## Dev

Node `>=22`, pnpm `>=11`.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

```bash
pnpm check          # lint + format + types
pnpm test           # Playwright (unit + Electron smoke)
pnpm build          # dist/ for packaging
pnpm exec electron-builder --linux AppImage:x64 tar.gz:x64 -p never
```

`origin` is `rjahir-rv/ruri`. Do **not** push to `pear-devs/pear-desktop`.

```bash
git remote add upstream https://github.com/pear-devs/pear-desktop.git
git fetch upstream
git merge upstream/master
```

Keep Ruri identity files (`package.json`, `electron-builder.yml`, `license`, `NOTICE`, `README.md`, icons, `src/i18n/index.ts`, `src/index.ts` app id).

## Credits

- [Pear Desktop](https://github.com/pear-devs/pear-desktop) (MIT) — host and plugins
- Glass look is original work. [Glassy Music](https://github.com/NanKillBro/glassy-music-nankill) is a visual reference only (GPL-3.0, not copied)

## License

MIT. Ruri additions: [rjahir-rv](https://github.com/rjahir-rv). Pear Desktop: th-ch / pear-devs. See [`license`](license) and [`NOTICE`](NOTICE).

> [!IMPORTANT]
> **No affiliation.** This project is not affiliated with, authorized by, endorsed by, or connected with Google LLC, YouTube, or their affiliates. Independent unofficial desktop shell.
>
> **Trademarks.** “Google”, “YouTube”, “YouTube Music”, and related marks belong to their owners. Use here is identification only.
>
> **AS IS.** The software is provided without warranty of any kind, express or implied. You use it at your own risk.
