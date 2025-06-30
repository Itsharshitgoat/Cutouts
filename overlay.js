const { ipcRenderer, clipboard } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const filter = document.getElementById('filter');
  const list = document.getElementById('overlay-list');
  let entries = [];
  let selectedIndex = 0;

  function renderList(filteredEntries) {
    list.innerHTML = '';
    filteredEntries.forEach((entry, index) => {
      const item = document.createElement('div');
      item.className = `list-item glass ${index === selectedIndex ? 'selected' : ''}`;
      item.textContent = entry.content.slice(0, 200) + (entry.content.length > 200 ? '...' : '');
      list.appendChild(item);
    });
  }

  ipcRenderer.send('get-recent-entries');
  ipcRenderer.on('recent-entries', (event, data) => {
    entries = data;
    renderList(entries);
    filter.focus();
  });

  filter.addEventListener('input', () => {
    const filtered = entries.filter(e => e.content.toLowerCase().includes(filter.value.toLowerCase()));
    selectedIndex = 0;
    renderList(filtered);
  });

  document.addEventListener('keydown', (e) => {
    const filtered = entries.filter(e => e.content.toLowerCase().includes(filter.value.toLowerCase()));
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
      renderList(filtered);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      renderList(filtered);
    }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      clipboard.writeText(filtered[selectedIndex].content);
      window.close();
    }
    if (e.key === 'Escape') window.close();
  });
});