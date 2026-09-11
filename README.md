<h1>
  <img src="assets/icon.png" alt="" width="72" height="72" align="absmiddle">
  Ruri
</h1>

**English** · [Español](README.es.md) · [Português](README.pt.md)

A refined desktop canvas for music, with frosted-glass chrome and a plugin gallery. An independent open-source client for YouTube Music, built on [Pear Desktop](https://github.com/pear-devs/pear-desktop) (MIT).

<p align="center">
  <img src="web/player2.png" alt="Ruri home with frosted chrome and album-art backdrop" width="920">
</p>

| | |
| --- | --- |
| Product | Ruri **0.3.0** <!-- x-release-please-version --> |
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

## Download

You do **not** need a GitHub account. Open the latest release and click the file for your computer — the download starts immediately:

**[Download Ruri](https://github.com/rjahir-rv/ruri/releases/latest)**

| Your computer | Click this file |
| --- | --- |
| Windows 10/11 (64-bit) | `Ruri Setup *.exe` (installer). `Ruri *.exe` is portable (no install). |
| Mac with Apple silicon (M1–M4) | `Ruri-*-arm64.dmg` |
| Mac with Intel | `Ruri-*.dmg` (the one **without** `arm64`) |
| Linux (Ubuntu/Debian) | `ruri_*_amd64.deb` or `Ruri-*.AppImage` |
| Other Linux | `Ruri-*.AppImage` or `ruri-*.tar.gz` |

Skip `.blockmap` files. Those are for the updater, not for installing.

Builds are unsigned. Windows SmartScreen and macOS Gatekeeper will warn; that is expected (see below).

## Install

### Windows

1. Download `Ruri Setup *.exe`.
2. If the browser says the file isn’t commonly downloaded, choose **Keep**, then **Keep anyway**.
3. When SmartScreen shows “Windows protected your PC”, click **More info**, then **Run anyway**.
4. Finish the installer. For the portable build, just run `Ruri *.exe`.

These prompts appear because the Windows build has no Authenticode certificate. Choose **Run anyway** / **Install anyway** — it is the same Ruri file you just downloaded.

### macOS

1. Download the `.dmg` that matches your chip (`arm64` = Apple silicon; no `arm64` = Intel).
2. Open the disk image and drag **Ruri** into **Applications**.
3. The first launch may say the app is **damaged** or can’t be opened. Gatekeeper does that to unsigned apps. After it is in Applications, run:

```bash
xattr -cr /Applications/Ruri.app
```

4. Open Ruri again. If macOS still blocks it: **System Settings → Privacy & Security → Open Anyway**.

Do not turn Gatekeeper off for the whole Mac.

### Linux

```bash
chmod +x Ruri-*.AppImage
./Ruri-*.AppImage
```

Debian/Ubuntu: install `ruri_*_amd64.deb` with your package manager.

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
pnpm test:unit      # Playwright unit tests (CI)
pnpm test:electron  # Electron smoke (Linux; use xvfb-run if headless)
pnpm test           # unit + electron
pnpm build          # dist/ for packaging
pnpm exec electron-builder --linux AppImage:x64 tar.gz:x64 -p never
```

Local packaging output: `pack/`.

Releases: merging to `master` opens a release-please PR (`chore: release X.Y.Z`) whose notes list **Features** and **Bug Fixes** from conventional commits. Merge that PR to tag and publish. GitHub Actions then attaches the Linux, Windows, and macOS files.

Manual fallback:

```bash
git tag v0.2.0
git push origin v0.2.0
```

`origin` is `rjahir-rv/ruri`. Do **not** push to `pear-devs/pear-desktop`.

```bash
git remote add upstream https://github.com/pear-devs/pear-desktop.git
git fetch upstream
git merge upstream/master
```

Keep Ruri identity files (`package.json`, `electron-builder.yml`, `license`, `NOTICE`, `README.md`, `README.es.md`, `README.pt.md`, icons, `src/i18n/index.ts`, `src/index.ts` app id).

This repository stays MIT. Do not vendor GPL-3.0 code (Better Lyrics, Glassy Music Merge Theme, or related extensions).

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
