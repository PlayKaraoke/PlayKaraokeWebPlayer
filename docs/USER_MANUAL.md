# PlayKaraoke Player: User Manual

> Applies to **v3.0**. For a short overview, see the [README](../README.md). The same guide is inside the app (**Settings › Help & manual**), in English and Portuguese.

**Contents**
1. [The screen at a glance](#1-the-screen-at-a-glance)
2. [Loading music](#2-loading-music)
3. [Playback controls](#3-playback-controls)
4. [Search: Devices and YouTube](#4-search-devices-and-youtube)
5. [Pads](#5-pads)
6. [The second screen](#6-the-second-screen)
7. [Show Mode (singer rotation)](#7-show-mode-singer-rotation)
8. [Settings](#8-settings)
9. [Keyboard shortcuts](#9-keyboard-shortcuts)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. The screen at a glance

- **Top bar:** search (Devices / YouTube), quick toggles (Second Screen, Autoplay, Applause, Ambient), the settings gear, and **Start Show Mode** / **End Show**.
- **Left:** the drop strip ("Drag karaoke files here") and the list: the **Queue**, or the **Singer rotation** in Show Mode. **Clear queue** sits at the bottom. In Show Mode the bottom has **+ Add singer** and **Manage singers** instead.
- **Right:** the preview (lyrics or video, sized to fill the free space), the song details, the progress bar, the controls, and the six **pads**.

With nothing loaded, the preview area shows **Drop a karaoke file here**. Click it to pick files.

## 2. Loading music

| Way to add a song | How |
|---|---|
| Drag & drop | Drop files **anywhere** on the screen |
| Click | The drop strip on the left, or the empty preview area, opens the file picker |
| Search | Type in the top bar and press **+** on a result ([section 4](#4-search-devices-and-youtube)) |

**Supported:** `.zip` containing a `.cdg` + audio file (`.mp3`, `.wav`, `.ogg`, `.m4a`), and `.mp4`. Other files are skipped, with a warning.

**Song info** comes from the file name, in the format `Code - Artist - Title` (the code is optional).

**Clicking a song in the queue** opens a dialog with its details. From there you can:
- set its key in advance: **Apply pitch** saves it without interrupting what's playing;
- start it right away: **Play**.

The row actions (up, down, remove) appear when you hover a song. You can also drag rows to reorder.

**When a song ends** it leaves the queue, and the **next song is loaded and paused**, ready to go. It only starts by itself if **Autoplay** is on, after the countdown. The loaded song is marked **PLAYING** while it plays; the one after it is marked **UP NEXT**.

## 3. Playback controls

| Control | What it does |
|---|---|
| **Play/Pause** | Toggles playback |
| **Restart** (↺) | Goes back to the start of the song and plays. Useful when the singer arrives late |
| **Stop** | Fully stops and clears the preview. Use it if anything gets stuck; it's always safe |
| **Next** (⏭) | Plays the next song in the queue. In Show Mode it's **End performance**, or **Skip turn** before the singer starts ([section 7](#7-show-mode-singer-rotation)) |
| **Pitch − / + / RESET** | Changes the key by semitones (±12) without changing speed, for CDG and MP4 |
| **Volume** | Main volume (songs, videos and pads). Ambient music has its own volume in Settings |

**Quick toggles** (top bar, filled when on)

| Toggle | When on |
|---|---|
| **Second Screen** | Opens or closes the second screen window |
| **Autoplay** | After a song ends, the next one starts on its own after a countdown |
| **Applause** | Applause plays automatically in the last seconds of each song, or earlier if the song goes silent near the end |
| **Ambient** | Background music plays only while no song is playing |

## 4. Search: Devices and YouTube

The search box is in the top bar. The **Devices / YouTube** switch next to it chooses where to search. Results open in a list below the box; press **+** to add a song (in Show Mode you'll be asked which singer it's for). Click outside or press `Esc` to close the list.

### Devices
Search a large local collection, such as an external drive, without browsing folders every time. **Chrome, Edge or Opera only.**

1. Connect your folder once in **Settings › Library** (**+ Connect folder**). Subfolders are included.
2. Wait for indexing. Only file names are read, and it runs in the background: the app stays responsive and you can watch the count. Very large drives (hundreds of thousands of files) take a few minutes the first time; you can **Cancel** and try later.
3. Type in the search box. Results appear as you type. It matches title, artist or code, in any order, and ignores case and accents: `avioes` finds *Aviões*.

Connected folders and their index are remembered, so opening the app doesn't rescan your drive. Click **↻** on a folder (Settings › Library) after adding or removing files. If the browser asks for permission again, click **Reconnect**. Hidden system files, such as the `._` files macOS creates on external drives, are ignored.

### YouTube
Find karaoke videos on YouTube. Works in any browser, as long as you're connected to the internet.

1. Switch to **YouTube**, type the song, and press **Enter**. The search doesn't run as you type, to save the daily search limit.
2. Press **+** on a result to add it.

YouTube songs show a **YOUTUBE** badge. They work in the queue, Show Mode and the second screen, and survive a page reload. Limitations:
- **No key change.** YouTube doesn't let the app access the audio.
- **Ads may appear.** They come from YouTube; you can click the video to skip them when YouTube allows.
- **Applause** plays in the last 5 seconds only (no silence detection).
- **Daily limit:** there's a daily cap on new online searches. Repeated searches don't count. When it's reached, the app tells you; use Devices until the next day.
- A video can become unavailable (removed or blocked). The app shows a warning. Remove it from the queue, or press **Next**.

## 5. Pads

Six sound-effect buttons under the controls. One tap plays the sound **from the start**; tapping again restarts it. Different pads can play at the same time.

The app comes with **Short applause, Long applause, Laughter, Drum roll** and **Horn**. The sixth pad is empty: tap **+ Load** to give it a sound.

In **Settings › Pads** you can rename any pad, replace its sound with your own audio file (MP3, WAV, M4A or OGG), remove a sound, or **Restore default pads**. Your sounds are saved in the browser and stay there after you close the app.

## 6. The second screen

A controls-free window for a TV, projector or singer-facing monitor.

1. Click the **Second Screen** toggle. If nothing opens, allow pop-ups for this site.
2. Drag the window to the other display and make it fullscreen (hover for the fullscreen button, or press `F11`).
3. It stays in sync: lyrics, video, countdown, the next two singers, and the idle image. The waiting screen is sized to the window, so it stays readable on a big TV.

**While the second screen is open, it becomes the main player** for video, which saves memory and processing on the operator's computer:
- **YouTube:** the video plays with sound **only on the second screen**. The main screen shows the cover and the controls (play/pause, seek bar, volume). If you use a key-change browser extension, apply it on the second screen window.
- **MP4:** the main screen plays only the audio (with the app's key change), and the video is decoded only on the second screen.
- **CDG:** the audio stays on the main screen, and the main screen uses lightweight drawing (it becomes a preview).
- Opening or closing the second screen mid-song hands playback over at the same point.

Click the toggle again to close it.

## 7. Show Mode (singer rotation)

The queue becomes a rotation of **singers**, each with up to **5 songs**. When a song ends, the turn moves to the next singer, and after the last singer it goes back to the first.

**Starting:** click **Start Show Mode**. The show's duration is counted from this moment.

**Adding singers and songs:** load music as usual and you'll be asked **Who is this song for?** The box is a searchable list: singers appear in alphabetical order and filter as you type; the first match is highlighted, so **Enter** picks it. To create a singer, type the new name and choose **Add "name" as a new singer** (or just press Enter when nothing matches). Singers whose queue is full (5/5) appear disabled. You can also use **+ Add singer** at the bottom of the list.

**During the show**
- The list shows every singer with their next song and a count (`2/5`). The singer whose turn it is is highlighted: **UP NEXT** before they start, **SINGING** while they sing. Their name also appears in the song details above the progress bar.
- Reorder singers with the arrows (on hover) or by dragging. Remove one with **✕**; that also removes their queued songs. If you remove the singer whose turn it is, the turn goes to the **next** singer.
- Click a singer to open **Manage singers** on them.
- When a performance ends, the next singer's song is **loaded and paused**. The preview shows the waiting screen with who's up next. Click **Start now**, or turn on Autoplay to start after the countdown.
- A singer with no song in queue simply waits. Add a song and they're ready.
- **Changing the song of the singer whose turn it is:** click **Change song** on their row and pick another song from your drives, YouTube or a file.
  - **Before they start** (last-minute request): the loaded song is replaced. You can also reorder or remove their songs in Manage singers; the loaded song updates automatically.
  - **Mid-song** (they give up and want another one): the current song stops and **doesn't count as sung**. The new one is loaded and paused; press **Play**.
- **Ending a performance early:** press **Next** (it becomes **End performance** in Show Mode) and confirm. The song counts as sung, with the time actually sung, and the turn moves on.
- **Skipping a turn:** before the singer starts (no song yet, or they left), **Next** becomes **Skip turn**. Confirm and the turn moves to the next singer. Nothing is logged, and the skipped singer stays in the rotation with their songs; to take them out, remove them in Manage singers. Needs at least two singers.

**Manage singers** (button at the bottom of the list, or Settings › Show Mode)
- Add, rename, reorder or remove singers.
- **Waiting queue:** reorder songs, set each song's key, remove songs, or **+ Add song** from your drives, YouTube or your computer.
- **Songs sung:** the singer's history for the night.

It's safe to edit the queue of the singer who's performing. The current song is tracked on its own, so nothing is skipped or counted twice.

**Ending the show:** click **End Show** and confirm. The report shows total duration, songs sung, singers, the highlight of the night, and a full timeline.
- **Export CSV:** the full history, opens correctly in Excel.
- **Start new show:** clears the rotation, the history and the queue.

## 8. Settings

Click the gear in the top bar. The sections are on the left.

| Section | Options |
|---|---|
| **General** | Language (English / Português), Theme (**Dark**, recommended for shows, or **Light**), **Performance mode** for older computers (CDG lyrics use much less processing; the look changes very slightly) |
| **Playback** | Autoplay and the wait between songs; automatic applause; ambient music: on/off, volume, and the source: **App songs** or **My songs** (a folder with your own MP3s, played in random order with no repeats) |
| **Display** | Background image shown when nothing is playing (ideal 1920×1080, lasts for the current session); custom CDG colors (experimental) |
| **Show Mode** | What the waiting screen shows between singers (upcoming singers, song titles, countdown; all on by default), and **Manage singers** |
| **Library** | Connected folders: **+ Connect folder**, update (↻), remove (✕), **Reconnect** when the browser asks |
| **Pads** | Names and sounds of the six pads ([section 5](#5-pads)) |
| **Shortcuts** | Turn keyboard shortcuts on or off, and the list of keys ([section 9](#9-keyboard-shortcuts)) |
| **About** | About PlayKaraoke, links, and how to support the project |

**Help & manual** at the bottom of the menu opens this guide in the app's language and theme.

## 9. Keyboard shortcuts

Shortcuts are **off by default**, so a bump on the keyboard can't disrupt the show. Turn them on in **Settings › Shortcuts**. They never work while you're typing or with a window open.

| Action | Mac | Windows |
|---|---|---|
| Play / Pause | `Space` | `Space` |
| Restart song | `⌘ ←` | `Ctrl ←` |
| Next song / End performance / Skip turn | `⌘ →` | `Ctrl →` |
| Stop | `⌘ .` | `Ctrl .` |
| Pitch up / down | `⌘ ↑` / `⌘ ↓` | `Ctrl ↑` / `Ctrl ↓` |
| Reset pitch | `⌘ 0` | `Ctrl 0` |
| Volume up / down | `⌘ ⇧ ↑` / `⌘ ⇧ ↓` | `Ctrl ⇧ ↑` / `Ctrl ⇧ ↓` |
| Fire pads 1–6 | `1` … `6` | `1` … `6` |
| Search | `/` | `/` |

## 10. Troubleshooting

| Problem | Solution |
|---|---|
| Stuck on "Loading" or not responding | Press **Stop**. It cancels any loading and resets the player |
| "The ZIP must contain a .cdg file and an audio file" | The zip doesn't have a valid `.cdg` + audio pair. Check the file |
| Device search shows nothing | Check in Settings › Library that the right folder is connected, and click **Reconnect** if asked |
| Second screen doesn't open | Allow pop-ups for this site |
| No key change on a video | Your browser doesn't support it for video. Use Chrome or Edge. YouTube songs never have key change |
| "Today's online search limit was reached" | The daily cap on online searches was used up. Use Devices, or try again tomorrow |
| Queue gone after reloading the page | Only songs from your connected folders and YouTube are restored after a reload. Re-add songs that were dragged in or picked manually |
| Shortcuts do nothing | Turn them on in Settings › Shortcuts, and click outside any text box |

All data (queue, singers, settings, folders, pad sounds) is stored locally in your browser. Clearing the browser data resets the app.
