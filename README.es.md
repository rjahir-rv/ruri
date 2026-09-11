<h1>
  <img src="assets/icon.png" alt="" width="72" height="72" align="absmiddle">
  Ruri
</h1>

[English](README.md) · **Español** · [Português](README.pt.md)

Un escritorio para música con cromo de vidrio esmerilado y una galería de plugins. Cliente independiente de código abierto para YouTube Music, basado en [Pear Desktop](https://github.com/pear-devs/pear-desktop) (MIT).

<p align="center">
  <img src="web/player2.png" alt="Inicio de Ruri con cromo esmerilado y fondo de la carátula" width="920">
</p>

| | |
| --- | --- |
| Producto | Ruri **0.2.0** <!-- x-release-please-version --> |
| Licencia | [MIT](license) — ver [NOTICE](NOTICE) |
| Id de la app | `dev.ruri.desktop` |
| Protocolo | `ruri:` |
| Ventana | 1600×900 por defecto, mínimo 1100×620 (se puede desactivar en Opciones → Avanzado) |
| Bifurcado de | pear-devs/pear-desktop 3.12.0 |

## Qué es

Ruri es una capa de escritorio alrededor del reproductor: cromo esmerilado, un fondo que sigue el álbum y plugins que se activan sin salir de la ventana. La carátula pinta el color y el desenfoque; el cromo no estorba.

- **Cromo de cristal** — navegación, búsqueda, menús y barra del reproductor translúcidos
- **Fondo desenfocado** — color y blur en vivo desde el álbum que suena
- **Letras** — líneas sincronizadas en la vista de reproducción, también a pantalla completa
- **Adblock** — bloqueo de rastreadores activado por defecto (Do Not Track)
- **Galería de plugins** — visualizadores, dispositivo de salida y más, desde el menú de la app
- **Protocolo `ruri://`** — play, pausa, salto y seek desde atajos, scripts o un Stream Deck

## Aspecto

El cristal viene activado. Windows y Linux usan la barra de título de la app; macOS conserva los semáforos nativos.

Más capturas: [reproducción](web/player1.png) · [cola](web/player2.png) · [letras a pantalla completa](web/fullscreen+lyrics.png) · [galería de plugins](web/plugins_menu.png)

Activados por defecto: **Glassy Theme**, **Glassy Backdrop**, **Album Color Theme**, **Synced Lyrics**, **Do Not Track** (adblock).

> [!NOTE]
> No actives Glassy Theme junto con Blur Navigation Bar (doble blur). Desactiva Transparent Player si Glassy Backdrop está encendido.

## Descargar

**No hace falta una cuenta de GitHub.** Abre la última versión y pulsa el archivo de tu equipo: la descarga empieza al momento.

**[Descargar Ruri](https://github.com/rjahir-rv/ruri/releases/latest)**

| Tu equipo | Pulsa este archivo |
| --- | --- |
| Windows 10/11 (64 bits) | `Ruri Setup *.exe` (instalador). `Ruri *.exe` es portable (no instala). |
| Mac con chip Apple (M1–M4) | `Ruri-*-arm64.dmg` |
| Mac con Intel | `Ruri-*.dmg` (el que **no** lleva `arm64`) |
| Linux (Ubuntu/Debian) | `ruri_*_amd64.deb` o `Ruri-*.AppImage` |
| Otro Linux | `Ruri-*.AppImage` o `ruri-*.tar.gz` |

No bajes los `.blockmap`. Son del actualizador, no del instalador.

Las compilaciones no están firmadas. Windows SmartScreen y Gatekeeper de macOS van a avisar; es lo esperado (ver abajo).

## Instalar

### Windows

1. Descarga `Ruri Setup *.exe`.
2. Si el navegador dice que el archivo no se suele descargar, elige **Conservar** y luego **Conservar de todos modos**.
3. Cuando SmartScreen muestre “Windows protegió tu PC”, pulsa **Más información** y después **Ejecutar de todos modos** (a veces **Instalar de todos modos**).
4. Termina el instalador. Con la versión portable, ejecuta `Ruri *.exe` directamente.

Esos avisos salen porque el build de Windows no tiene certificado Authenticode. Elige **Ejecutar de todos modos** / **Instalar de todos modos**: es el mismo archivo de Ruri que acabas de bajar.

### macOS

1. Descarga el `.dmg` de tu chip (`arm64` = Apple silicon; sin `arm64` = Intel).
2. Abre la imagen de disco y arrastra **Ruri** a **Aplicaciones**.
3. Al abrirla, macOS puede decir que la app está **dañada** o que no se puede abrir. Gatekeeper hace eso con apps sin firmar. Cuando ya esté en Aplicaciones, en Terminal:

```bash
xattr -cr /Applications/Ruri.app
```

4. Abre Ruri otra vez. Si sigue bloqueada: **Ajustes del Sistema → Privacidad y seguridad → Abrir de todos modos**.

No desactives Gatekeeper en todo el Mac.

### Linux

```bash
chmod +x Ruri-*.AppImage
./Ruri-*.AppImage
```

Debian/Ubuntu: instala `ruri_*_amd64.deb` con el gestor de paquetes.

## Protocolo

La app empaquetada registra `ruri://`:

```
ruri://play
ruri://pause
ruri://playPause
ruri://next
ruri://previous
ruri://like
ruri://seekTo%2030
```

Los argumentos se separan con un espacio codificado (`%20`).

Linux: `xdg-open 'ruri://playPause'`. No uses el esquema `youtubemusic:` de Pear.

## Desarrollo

Node `>=22`, pnpm `>=11`.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

```bash
pnpm check          # lint + formato + tipos
pnpm test:unit      # tests unitarios de Playwright (CI)
pnpm test:electron  # smoke de Electron (Linux; xvfb-run si no hay pantalla)
pnpm test           # unit + electron
pnpm build          # dist/ para empaquetar
pnpm exec electron-builder --linux AppImage:x64 tar.gz:x64 -p never
```

Salida local: `pack/`.

Releases: un merge a `master` abre un PR de release-please (`chore: release X.Y.Z`) con **Features** y **Bug Fixes** a partir de conventional commits. Al mergear ese PR se crea el tag y se publica. GitHub Actions adjunta los archivos de Linux, Windows y macOS.

Reserva manual:

```bash
git tag v0.2.0
git push origin v0.2.0
```

`origin` es `rjahir-rv/ruri`. **No** empujes a `pear-devs/pear-desktop`.

```bash
git remote add upstream https://github.com/pear-devs/pear-desktop.git
git fetch upstream
git merge upstream/master
```

Conserva los archivos de identidad de Ruri (`package.json`, `electron-builder.yml`, `license`, `NOTICE`, `README.md`, `README.es.md`, `README.pt.md`, iconos, `src/i18n/index.ts`, id de la app en `src/index.ts`).

El repositorio se queda en MIT. No incorpores código GPL-3.0 (Better Lyrics, Merge Theme de Glassy Music u extensiones relacionadas).

## Créditos

- [Pear Desktop](https://github.com/pear-devs/pear-desktop) (MIT) — anfitrión y plugins
- El aspecto de cristal es original. [Glassy Music](https://github.com/NanKillBro/glassy-music-nankill) es solo referencia visual (GPL-3.0, no se copió)

## Licencia

MIT. Añadidos de Ruri: [rjahir-rv](https://github.com/rjahir-rv). Pear Desktop: th-ch / pear-devs. Ver [`license`](license) y [`NOTICE`](NOTICE).

> [!IMPORTANT]
> **Sin afiliación.** Este proyecto no está afiliado, autorizado, respaldado ni conectado con Google LLC, YouTube ni sus afiliados. Capa de escritorio independiente y no oficial.
>
> **Marcas.** “Google”, “YouTube”, “YouTube Music” y marcas relacionadas pertenecen a sus dueños. Aquí se usan solo para identificar el servicio.
>
> **TAL CUAL.** El software se ofrece sin garantía de ningún tipo, expresa o implícita. Lo usas bajo tu propio riesgo.
