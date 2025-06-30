# Cutouts

Cutouts is a modern, beautiful clipboard manager built with Electron and SQLite. It provides a seamless way to manage, search, and organize your clipboard history with features like auto-tagging, pinning, quick overlay paste, and more—all wrapped in a glassmorphic UI.

---

## Features

- **Clipboard History:** Automatically saves everything you copy, including text, links, and emails.
- **Auto-Tagging:** Detects and tags links and emails for easy filtering.
- **Search & Filter:** Instantly search your clipboard history by content or tags (Ctrl+F).
- **Pinning:** Pin important entries to keep them at the top.
- **Quick Overlay Paste:** Use `Ctrl+Shift+V` for a fast overlay to select and paste recent entries.
- **Keyboard Shortcuts:**
  - `Ctrl+Shift+Z`: Show main window
  - `Ctrl+Shift+V`: Show overlay window
  - `Ctrl+F`: Focus search bar
  - `P`: Pin/unpin selected entry
  - `Delete/Backspace`: Revoke (delete) selected entry
- **Glassmorphic UI:** Sleek, frosted-glass design with smooth animations and custom icons.
- **Sound Effects:** Optional tick sound for actions.
- **Dark Mode:** Consistent, modern dark theme.

---

## Installation

1. **Clone or Download** this repository.
2. **Install Dependencies:**
   ```sh
   npm install
   ```
3. **Run the App:**
   ```sh
   npm start
   ```

---

## Usage

- **Main Window:**
  - View, search, pin, and manage your clipboard history.
  - Click on an entry to view full content and copy.
  - Use the search bar to filter by content or tags.
  - Pin entries to keep them at the top.
  - Revoke (delete) entries you no longer need.
- **Overlay Window:**
  - Press `Ctrl+Shift+V` to open a quick overlay for fast pasting.
  - Filter and select recent entries with keyboard navigation (Up/Down/Enter).

---

## File Structure

- `main.js` — Electron main process, window management, clipboard monitoring, SQLite integration.
- `renderer.js` — Renderer process for the main window (UI logic, IPC communication).
- `overlay.js` — Renderer process for the overlay window (quick paste UI).
- `index.html` — Main window UI.
- `overlay.html` — Overlay window UI.
- `styles.css` — Glassmorphic styles and layout.
- `package.json` — Project metadata and dependencies.

---

## Database

- Uses SQLite to store clipboard entries in `cutouts.db` (in Electron's user data directory).
- Table: `clipboard_entries`
  - `id` (INTEGER, PRIMARY KEY)
  - `content` (TEXT)
  - `timestamp` (DATETIME)
  - `type` (TEXT)
  - `tags` (TEXT, JSON array)
  - `pinned` (BOOLEAN)
  - `revoked` (BOOLEAN)

---

## Customization

- **Icons & Images:**
  - Place your own icons (e.g., `icon.png`, `copy.png`, `star.jpg`, `sadstar.png`, `bin.png`, `min.png`, `clo.png`, `sad.jpg`) in the project directory for a personalized look.
- **Sound:**
  - The tick sound is embedded as a base64 WAV. Replace with your own if desired.

---

## Keyboard Shortcuts

| Shortcut           | Action                        |
|--------------------|------------------------------|
| Ctrl+Shift+Z       | Show main window             |
| Ctrl+Shift+V       | Show overlay window          |
| Ctrl+F             | Focus search bar             |
| P                  | Pin/unpin selected entry     |
| Delete/Backspace   | Revoke selected entry        |
| Up/Down/Enter      | Navigate overlay entries     |

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Credits

- Created by [itsharshitgoat](https://itsharshitgoat.github.io/Website/)

---

## Troubleshooting

- If you encounter issues with clipboard monitoring, ensure you have the required permissions.
- For Windows, run as administrator if global shortcuts or clipboard access fails.
- If the UI does not display correctly, check that all image/icon files are present in the project directory.

---

Enjoy using **Cutouts**!
