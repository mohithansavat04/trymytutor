// --- Master Data ---
window.appState = window.appState || {};
window.appState.masterDataPage = 1;
window.appState.masterDataSearch = '';

window.fetchMasterData = async (page = 1) => {
  window.appState.masterDataPage = page;
  try {
    const res = await fetch(`${API_BASE}/master-data?page=${page}&limit=10&search=${window.appState.masterDataSearch || ''}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status === 401) return checkAuth();
    const _resJson = await res.json();
    const items = _resJson.data || _resJson;
    renderMasterData(items);
  } catch (err) {
    console.error('Failed to fetch master data', err);
  }
};

const renderMasterData = (items) => {
  const tbody = document.getElementById('masterDataTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-500">No Master Data found</td></tr>';
    return;
  }
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-brand-border/50 hover:bg-slate-800/30 transition-colors';
    tr.innerHTML = `<td class="py-4 px-6 text-slate-300 font-medium">${item.name}</td>
                    <td class="py-4 px-6 text-slate-300">${item.type}</td>
                    <td class="py-4 px-6 text-slate-300">${item.value || '-'}</td>
                    <td class="py-4 px-6 text-right space-x-2">
                        <button onclick="deleteMasterData('${item._id}')" class="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });
};

setTimeout(() => {
  const el = document.getElementById('searchMasterData');
  if (el) {
    let debounceTimer;
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.masterDataSearch = e.target.value;
          window.fetchMasterData(1);
        }
      }, 400);
    };
  }

  const openModalBtn = document.getElementById('openAddMasterDataModal');
  const closeModalBtn = document.getElementById('closeMasterDataFormModal');
  const cancelModalBtn = document.getElementById('cancelMasterDataFormBtn');
  const modal = document.getElementById('masterDataFormModal');

  const openModal = () => {
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.add('opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 300);
    }
  };

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  const form = document.getElementById('masterDataForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          name: document.getElementById('formMasterDataName').value,
          type: document.getElementById('formMasterDataType').value,
          status: document.getElementById('formMasterDataStatus').value === 'true'
        };
        const res = await fetch(`${window.API_BASE}/master-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.getToken()}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          closeModal();
          form.reset();
          window.fetchMasterData(1);
        } else {
          alert('Failed to add master data entry');
        }
      } catch (err) {
        console.error(err);
      }
    };
  }
}, 500);

window.deleteMasterData = async (id) => {
  if (confirm('Are you sure you want to delete this master data entry?')) {
    await fetch(`${API_BASE}/master-data/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    window.fetchMasterData(window.appState.masterDataPage);
  }
};
