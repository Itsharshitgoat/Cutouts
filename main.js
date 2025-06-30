const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const clipboardListener = require('clipboard-event');
const path = require('path');

// Initialize SQLite database
const dbPath = path.join(app.getPath('userData'), 'cutouts.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clipboard_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT DEFAULT 'text',
      tags TEXT,
      pinned BOOLEAN DEFAULT 0,
      revoked BOOLEAN DEFAULT 0
    )
  `);
});

// Window variables
let mainWindow, overlayWindow;

// Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 672,
    height: 479,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => (mainWindow = null));
}

// Create overlay window
function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  overlayWindow.loadFile('overlay.html');
  overlayWindow.on('blur', () => overlayWindow.hide());
  overlayWindow.on('closed', () => (overlayWindow = null));
}

// Auto-tagging function
function getTags(content) {
  const tags = [];
  if (/^https?:\/\//i.test(content)) tags.push('Link');
  if (/\S+@\S+\.\S+/.test(content)) tags.push('Email');
  return tags;
}

app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();

  // Register keyboard shortcuts
  globalShortcut.register('Control+Shift+Z', () => mainWindow.show());
  globalShortcut.register('Control+Shift+V', () => overlayWindow.show());

  // Clipboard monitoring
  clipboardListener.startListening();
  clipboardListener.on('change', () => {
    const content = require('electron').clipboard.readText();
    if (content) {
      const tags = JSON.stringify(getTags(content));
      db.run(
        'INSERT INTO clipboard_entries (content, tags) VALUES (?, ?)',
        [content, tags],
        (err) => {
          if (err) console.error('DB Insert Error:', err);
          if (mainWindow) mainWindow.webContents.send('clipboard-updated');
        }
      );
    }
  });

  // IPC handlers
  ipcMain.on('get-clipboard-history', (event, query = '') => {
    db.all(
      `SELECT * FROM clipboard_entries 
       WHERE revoked = 0 AND (content LIKE ? OR tags LIKE ?) 
       ORDER BY pinned DESC, timestamp DESC LIMIT 100`,
      [`%${query}%`, `%${query}%`],
      (err, rows) => {
        if (err) console.error('DB Query Error:', err);
        event.reply('clipboard-history', rows || []);
      }
    );
  });

  ipcMain.on('get-recent-entries', (event) => {
    db.all(
      'SELECT * FROM clipboard_entries WHERE revoked = 0 ORDER BY timestamp DESC LIMIT 10',
      (err, rows) => {
        event.reply('recent-entries', rows || []);
      }
    );
  });

  ipcMain.on('pin-entry', (event, id) => {
    db.run('UPDATE clipboard_entries SET pinned = 1 WHERE id = ?', [id]);
  });

  ipcMain.on('unpin-entry', (event, id) => {
    db.run('UPDATE clipboard_entries SET pinned = 0 WHERE id = ?', [id]);
  });

  ipcMain.on('revoke-entry', (event, id) => {
    db.run('UPDATE clipboard_entries SET revoked = 1 WHERE id = ?', [id]);
  });

  ipcMain.on('window-control', (event, action) => {
    if (action === 'minimize') mainWindow.minimize();
    if (action === 'close') mainWindow.hide();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  clipboardListener.stopListening();
  db.close();
});