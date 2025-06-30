const { ipcRenderer, clipboard, shell } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('search');
  const list = document.getElementById('clipboard-list');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modal-text');
  const copyModal = document.getElementById('copy-modal');
  const closeModal = document.getElementById('close-modal');
  const toast = document.getElementById('toast');
  const creatorBtn = document.querySelector('.creator-btn');

  // Sound effects
  const tickSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');

  // Window controls
  document.getElementById('minimize').addEventListener('click', () => ipcRenderer.send('window-control', 'minimize'));
  document.getElementById('close').addEventListener('click', () => ipcRenderer.send('window-control', 'close'));

  // Creator button
  creatorBtn.addEventListener('click', () => {
    shell.openExternal('https://itsharshitgoat.github.io/Website/');
    tickSound.play().catch(() => {}); // Play sound (optional)
  });

  // Show toast notification
  function showToast() {
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
    tickSound.play().catch(() => {}); // Play sound (optional)
  }

  // Load clipboard history
  function loadHistory(query = '') {
    ipcRenderer.send('get-clipboard-history', query);
  }

  ipcRenderer.on('clipboard-history', (event, entries) => {
    list.innerHTML = '';
    entries.forEach(entry => {
      const item = document.createElement('div');
      item.className = `list-item glass ${entry.pinned ? 'pinned' : ''}`;
      item.innerHTML = `
        <span class="content-preview" title="${entry.content}">${entry.content.slice(0, 200)}${entry.content.length > 200 ? '...' : ''}</span>
        <span class="tags">${JSON.parse(entry.tags || '[]').map(tag => `<span>${tag}</span>`).join('')}</span>
        <div class="actions">
          <button class="copy"><img src="copy.png" alt="Copy" style="width:16px;height:16px;vertical-align:middle;" /></button>
          <button class="pin">
            <img src="${entry.pinned ? 'star.jpg' : 'sadstar.png'}" alt="Pin" style="width:16px;height:16px;vertical-align:middle;" />
          </button>
          <button class="revoke"><img src="bin.png" alt="Delete" style="width:16px;height:16px;vertical-align:middle;" /></button>
        </div>
      `;
      item.querySelector('.content-preview').addEventListener('click', () => {
        modalText.textContent = entry.content;
        modal.classList.remove('hidden');
      });
      item.querySelector('.copy').addEventListener('click', () => {
        clipboard.writeText(entry.content);
        showToast();
      });
      item.querySelector('.pin').addEventListener('click', () => {
        ipcRenderer.send(entry.pinned ? 'unpin-entry' : 'pin-entry', entry.id);
        loadHistory(search.value);
        tickSound.play().catch(() => {});
      });
      item.querySelector('.revoke').addEventListener('click', () => {
        ipcRenderer.send('revoke-entry', entry.id);
        loadHistory(search.value);
      });
      item.querySelectorAll('.tags span').forEach(tag => {
        tag.addEventListener('click', () => {
          search.value = tag.textContent;
          loadHistory(tag.textContent);
        });
      });
      list.appendChild(item);
    });
  });

  // Search functionality
  search.addEventListener('input', () => loadHistory(search.value));
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      search.focus();
    }
    if (e.key === 'p' && document.activeElement !== search) {
      const selected = list.querySelector('.list-item:hover .pin');
      if (selected) selected.click();
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && document.activeElement !== search) {
      const selected = list.querySelector('.list-item:hover .revoke');
      if (selected) selected.click();
    }
  });

  // Modal controls
  copyModal.addEventListener('click', () => {
    clipboard.writeText(modalText.textContent);
    modal.classList.add('hidden');
    showToast();
  });
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));

  // Initial load and update listener
  loadHistory();
  ipcRenderer.on('clipboard-updated', () => loadHistory(search.value));
});