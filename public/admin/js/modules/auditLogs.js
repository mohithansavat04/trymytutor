// --- Audit Logs ---
window.appState = window.appState || {};
window.appState.auditLogsPage = 1;
window.appState.auditLogsSearch = '';

window.fetchAuditLogs = async (page = 1) => {
  window.appState.auditLogsPage = page;
  try {
    const res = await fetch(`${API_BASE}/audit-logs?page=${page}&limit=10&search=${window.appState.auditLogsSearch || ''}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status === 401) return checkAuth();
    const _resJson = await res.json();
    const items = _resJson.data || _resJson;
    renderAuditLogs(items);
  } catch (err) {
    console.error('Failed to fetch auditLogs', err);
  }
};

const renderAuditLogs = (items) => {
  const tbody = document.getElementById('auditLogsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-500">No Audit Logs found</td></tr>';
    return;
  }
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-brand-border/50 hover:bg-slate-800/30 transition-colors';
    tr.innerHTML = `<td class="py-4 px-6 text-slate-300 text-sm font-mono">${new Date(item.createdAt).toLocaleString()}</td>
                    <td class="py-4 px-6 text-slate-300">${item.action}</td>
                    <td class="py-4 px-6 text-slate-300">${item.module}</td>`;
    tbody.appendChild(tr);
  });
};

setTimeout(() => {
  const el = document.getElementById('searchAuditLogs');
  if (el) {
    let debounceTimer;
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.auditLogsSearch = e.target.value;
          window.fetchAuditLogs(1);
        }
      }, 400);
    };
  }
}, 200);
