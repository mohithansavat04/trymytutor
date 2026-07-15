// --- Chat Monitoring ---
window.appState = window.appState || {};
window.appState.chatsPage = 1;
window.appState.chatsSearch = '';

window.fetchChats = async (page = 1) => {
  window.appState.chatsPage = page;
  try {
    const res = await fetch(`${API_BASE}/messages?page=${page}&limit=10&search=${window.appState.chatsSearch || ''}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status === 401) return checkAuth();
    const _resJson = await res.json();
    const items = _resJson.data || _resJson;
    renderChats(items);
  } catch (err) {
    console.error('Failed to fetch chats', err);
  }
};

const renderChats = (items) => {
  const tbody = document.getElementById('chatsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-500">No Chat Messages found</td></tr>';
    return;
  }
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-brand-border/50 hover:bg-slate-800/30 transition-colors';
    tr.innerHTML = `<td class="py-4 px-6 text-slate-300 font-medium">${item.senderId || 'Unknown'}</td>
                    <td class="py-4 px-6 text-slate-300">${item.receiverId || 'Unknown'}</td>
                    <td class="py-4 px-6 text-slate-300 text-sm max-w-[250px] truncate">${item.content || '-'}</td>
                    <td class="py-4 px-6 text-slate-300">${item.isFlagged ? '<span class="text-red-400">Flagged</span>' : '<span class="text-green-400">Clean</span>'}</td>
                    <td class="py-4 px-6 text-right space-x-2">
                        <button onclick="toggleChatFlag('${item._id}', ${!item.isFlagged})" class="px-3 py-1 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg text-xs font-medium transition-colors">${item.isFlagged ? 'Unflag' : 'Flag'}</button>
                        <button onclick="deleteChat('${item._id}')" class="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });
};

setTimeout(() => {
  const el = document.getElementById('searchChats');
  if (el) {
    let debounceTimer;
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.chatsSearch = e.target.value;
          window.fetchChats(1);
        }
      }, 400);
    };
  }
}, 500);

window.toggleChatFlag = async (id, isFlagged) => {
    await fetch(`${API_BASE}/chats/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ isFlagged })
    });
    window.fetchChats(window.appState.chatsPage);
};

window.deleteChat = async (id) => {
  if (confirm('Are you sure you want to delete this message?')) {
    await fetch(`${API_BASE}/chats/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    window.fetchChats(window.appState.chatsPage);
  }
};
