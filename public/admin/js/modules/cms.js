// --- CMS Management ---
window.appState = window.appState || {};

window.fetchCms = async () => {
  try {
    const res = await fetch(`${window.API_BASE}/cms`, {
      headers: { 'Authorization': `Bearer ${window.getToken()}` }
    });
    if (res.ok) {
      const data = await res.json();
      const container = document.getElementById('cmsTableContainer');
      if (data.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-center py-12">No CMS pages found.</p>';
      } else {
        let html = `<table class="w-full text-left mt-4"><thead class="text-xs uppercase bg-slate-800 text-slate-400"><tr><th class="px-4 py-3">Title</th><th class="px-4 py-3">Slug</th><th class="px-4 py-3">Status</th><th class="px-4 py-3 text-right">Actions</th></tr></thead><tbody class="divide-y divide-slate-800">`;
        data.forEach(c => {
          html += `<tr class="hover:bg-slate-800/50">
            <td class="px-4 py-3 text-sm text-white font-medium">${c.title}</td>
            <td class="px-4 py-3 text-sm text-slate-400">/${c.slug}</td>
            <td class="px-4 py-3 text-sm"><span class="px-2 py-1 bg-brand/10 text-brand rounded">${c.status}</span></td>
            <td class="px-4 py-3 text-right">
              <button onclick="deleteCms('${c._id}')" class="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">Delete</button>
            </td>
          </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;
      }
    }
  } catch (err) {
    console.error(err);
    const container = document.getElementById('cmsTableContainer');
    if (container) {
      container.innerHTML = `<p class="text-red-400 text-center py-12">Error loading CMS pages.</p>`;
    }
  }
};

window.openCmsModal = () => {
  const modal = document.getElementById('cmsModal');
  if (modal) {
    document.getElementById('cmsId').value = '';
    document.getElementById('cmsTitle').value = '';
    document.getElementById('cmsSlug').value = '';
    document.getElementById('cmsBodyContent').value = '';
    document.getElementById('cmsStatus').value = 'draft';
    modal.classList.remove('hidden');
  }
};

window.closeCmsModal = () => {
  const modal = document.getElementById('cmsModal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

window.submitCms = async () => {
  try {
    const payload = {
      title: document.getElementById('cmsTitle').value,
      slug: document.getElementById('cmsSlug').value,
      content: document.getElementById('cmsBodyContent').value,
      status: document.getElementById('cmsStatus').value
    };

    const res = await fetch(`${window.API_BASE}/cms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.getToken()}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      window.closeCmsModal();
      window.fetchCms();
    } else {
      alert('Failed to save CMS page.');
    }
  } catch (err) {
    console.error(err);
    alert('An error occurred while saving the CMS page.');
  }
};

window.deleteCms = async (id) => {
  if (confirm('Are you sure you want to delete this CMS page?')) {
    try {
      await fetch(`${window.API_BASE}/cms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${window.getToken()}` }
      });
      window.fetchCms();
    } catch (err) {
      console.error(err);
    }
  }
};
