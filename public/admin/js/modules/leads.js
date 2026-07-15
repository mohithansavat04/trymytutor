// --- Leads Distribution ---
window.appState = window.appState || {};
window.appState.leadsPage = 1;
window.appState.leadsSearch = '';

window.fetchLeads = async (page = 1) => {
  window.appState.leadsPage = page;
  try {
    const res = await fetch(`${API_BASE}/leads?page=${page}&limit=10&search=${window.appState.leadsSearch || ''}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status === 401) return checkAuth();
    const _resJson = await res.json();
    const items = _resJson.data || _resJson;
    renderLeads(items);
  } catch (err) {
    console.error('Failed to fetch leads', err);
  }
};

const renderLeads = (items) => {
  const tbody = document.getElementById('leadsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-500">No Leads found</td></tr>';
    return;
  }
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-brand-border/50 hover:bg-slate-800/30 transition-colors';
    tr.innerHTML = `<td class="py-4 px-6 text-slate-300 text-sm font-mono">${item.requirementId || item._id}</td>
                    <td class="py-4 px-6 text-slate-300">${item.tutorId || 'Unknown'}</td>
                    <td class="py-4 px-6 text-slate-300">${item.stage || 'Initial'}</td>
                    <td class="py-4 px-6 text-slate-300">${item.status || 'Pending'}</td>
                    <td class="py-4 px-6 text-right space-x-2">
                        <button onclick="deleteLead('${item._id}')" class="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">Recall</button>
                    </td>`;
    tbody.appendChild(tr);
  });
};

setTimeout(() => {
  const el = document.getElementById('searchLeads');
  if (el) {
    let debounceTimer;
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.leadsSearch = e.target.value;
          window.fetchLeads(1);
        }
      }, 400);
    };
  }
  
  const form = document.getElementById('pushLeadForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          requirementId: document.getElementById('leadRequirement').value,
          tutorId: document.getElementById('leadTutor').value
        };
        const res = await fetch(`${API_BASE}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          document.getElementById('pushLeadModal').classList.add('hidden');
          form.reset();
          window.fetchLeads(1);
        }
      } catch (err) {}
    };
  }
}, 500);

window.deleteLead = async (id) => {
  if (confirm('Are you sure you want to recall this lead?')) {
    await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    window.fetchLeads(window.appState.leadsPage);
  }
};
