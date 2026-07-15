window.fetchDisputes = async () => {
  try {
    const res = await fetch('/api/admin/disputes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch disputes');
    const data = await res.json();
    const tbody = document.getElementById('disputesTableBody');
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="py-16 text-center text-slate-500">No active disputes</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(item => `
      <tr class="hover:bg-slate-800/30 transition-colors">
        <td class="py-4 px-6 text-sm text-slate-300 font-mono">${item._id.substring(0,8)}</td>
        <td class="py-4 px-6 text-sm text-slate-300 font-mono">${item.sessionId ? item.sessionId.substring(0,8) : 'N/A'}</td>
        <td class="py-4 px-6 text-sm text-slate-300">${item.tutorClaimStatus || 'Claimed Completed'}</td>
        <td class="py-4 px-6 text-sm">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'Settled' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}">
            ${item.status}
          </span>
        </td>
        <td class="py-4 px-6 text-sm">
          <button onclick="window.openResolveDisputeModal('${item._id}')" class="text-brand hover:text-orange-400 transition-colors">Resolve Case</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
};

window.openResolveDisputeModal = (id) => {
  document.getElementById('resolveDisputeId').value = id;
  document.getElementById('resolveDisputeModal').classList.remove('hidden');
};

document.getElementById('resolveDisputeForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('resolveDisputeId').value;
  const status = document.getElementById('disputeStatus').value;
  const notes = document.getElementById('internalInvestigationNotes').value;
  try {
    const res = await fetch(`/api/admin/disputes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ status, internalInvestigationNotes: notes })
    });
    if(res.ok) {
      document.getElementById('resolveDisputeModal').classList.add('hidden');
      window.fetchDisputes();
    }
  } catch(err) {
    console.error(err);
  }
});