# Ruri

Ruri is a client for music player. A fork of [Pear Desktop](https://github.com/pear-devs/pear-desktop) (MIT).

**Not** YouTube, Google, Pear Desktop, or [Glassy Music](https://github.com/NanKillBro/glassy-music-nankill).

> [!IMPORTANT]
> ⚠️ Disclaimer
>
> **No Affiliation**
>
> This project, and its contributors, are not affiliated with, authorized by, endorsed by, or in any way officially connected with Google LLC, YouTube, or any of their subsidiaries or affiliates. **This is an independent, unofficial desktop shell.**
>
> **Trademarks**
>
> The names "Google" and "YouTube Music", as well as related names, marks, emblems, and images, are registered trademarks of their respective owners. Any use of these trademarks is for identification and reference purposes only and does not imply any association with the trademark holder.
>
> **Limitation of Liability**
>
> This application is provided "AS IS", and you use it at your own risk. In no event shall the developers or contributors be liable for any claim, damages, or other liability arising from the software or its use.

| | |
| --- | --- |
| Product | Ruri |
| License | [MIT](license) — see [NOTICE](NOTICE) |
| App id | `dev.ruri.desktop` |
| Protocol | `ruri:` |
| Min window | 1100×620 (disable under Options → Advanced) |
| Forked from | pear-devs/pear-desktop 3.12.0 |

This repository stays MIT. Do not vendor GPL-3.0 code (Better Lyrics, Glassy Music Merge Theme, or related extensions).

## Deep links

The packaged app registers `ruri://`. Commands are playback controls:

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
Linux example: `xdg-open 'ruri://playPause'`. Do not use Pear’s `youtubemusic:` scheme.

## First publish

`origin` is `rjahir-rv/ruri`. Do **not** push to `pear-devs/pear-desktop` (`upstream`).

```bash
git remote add upstream https://github.com/pear-devs/pear-desktop.git
git fetch upstream
git merge upstream/master
```

Keep Ruri identity files (`package.json`, `electron-builder.yml`, `license`, `NOTICE`, `README.md`, icons, `src/i18n/index.ts`, `src/index.ts` app id).

## Dev

Node `>=22`, pnpm `>=11`.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

```bash
pnpm check          # lint + format + types
pnpm test           # Playwright
pnpm dist:linux     # AppImage / deb / rpm / …
```

## Build

- `pnpm dist:linux` — Linux (amd64)
- `pnpm dist:linux:deb-arm64` / `pnpm dist:linux:rpm-arm64`
- `pnpm dist:win` / `pnpm dist:mac` / `pnpm dist:mac:arm64`

Output: `pack/`. No signed auto-update yet.

## Credits

- [Pear Desktop](https://github.com/pear-devs/pear-desktop) (MIT) — host and plugins
- Glass look is original work. [Glassy Music](https://github.com/NanKillBro/glassy-music-nankill) is a visual reference only (GPL-3.0, not copied)

## License

MIT. Ruri additions: [rjahir-rv](https://github.com/rjahir-rv). Pear Desktop: th-ch / pear-devs. See [`license`](license) and [`NOTICE`](NOTICE).
