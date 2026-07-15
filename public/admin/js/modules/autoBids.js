window.fetchAutoBids = async () => {
  try {
    const res = await fetch('/api/admin/auto-bids', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch auto bids');
    const data = await res.json();
    const tbody = document.getElementById('autoBidsTableBody');
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="py-16 text-center text-slate-500">No auto-bid logs found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(item => `
      <tr class="hover:bg-slate-800/30 transition-colors">
        <td class="py-4 px-6 text-sm text-slate-300 font-mono">${item.requirementId ? item.requirementId._id.substring(0,8) : 'N/A'}</td>
        <td class="py-4 px-6 text-sm text-slate-300 font-medium">₹${item.calculatedAveragePrice}</td>
        <td class="py-4 px-6 text-sm text-slate-300">${item.injectionDelayTimer} mins</td>
        <td class="py-4 px-6 text-sm">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${item.executionStatus === 'Dispatched' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : item.executionStatus === 'Failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}">
            ${item.executionStatus}
          </span>
        </td>
        <td class="py-4 px-6 text-sm text-slate-400">${new Date(item.createdAt).toLocaleDateString()}</td>
        <td class="py-4 px-6 text-sm">
          <button class="text-brand hover:text-orange-400 transition-colors">View Log</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
};

document.getElementById('configureAutoBidForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const active = document.getElementById('autoBidEngineActive').value === 'true';
  const delay = document.getElementById('autoBidDelay').value;
  try {
    const res = await fetch('/api/admin/auto-bids/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ autoBidEngineActive: active, autoBidDelay: delay })
    });
    if(res.ok) {
      document.getElementById('configureAutoBidModal').classList.add('hidden');
      alert('Engine Configuration Saved!');
    }
  } catch(err) {
    console.error(err);
  }
});