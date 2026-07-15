window.fetchRefunds = async () => {
  try {
    const res = await fetch('/api/admin/refunds', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch refunds');
    const data = await res.json();
    const tbody = document.getElementById('refundsTableBody');
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="py-16 text-center text-slate-500">No account closures pending</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(item => `
      <tr class="hover:bg-slate-800/30 transition-colors">
        <td class="py-4 px-6 text-sm text-slate-300 font-mono">${item._id.substring(0,8)}</td>
        <td class="py-4 px-6 text-sm text-slate-300 font-medium">${item.userId ? item.userId.name : 'Unknown'}</td>
        <td class="py-4 px-6 text-sm text-slate-300">₹${item.remainingBalance}</td>
        <td class="py-4 px-6 text-sm text-slate-300">₹${item.depositLeft} / ₹2500</td>
        <td class="py-4 px-6 text-sm">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'Disbursed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : item.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}">
            ${item.status}
          </span>
        </td>
        <td class="py-4 px-6 text-sm">
          <button onclick="window.openProcessRefundModal('${item._id}')" class="text-brand hover:text-orange-400 transition-colors font-medium">Process</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
};

window.openProcessRefundModal = (id) => {
  document.getElementById('processRefundId').value = id;
  document.getElementById('processRefundModal').classList.remove('hidden');
};

document.getElementById('openTerminationForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    userId: document.getElementById('termUserId').value,
    remainingBalance: document.getElementById('termRemainingBalance').value,
    depositLeft: document.getElementById('termDepositLeft').value,
    settlementMethod: document.getElementById('termSettlementMethod').value,
  };
  try {
    const res = await fetch('/api/admin/refunds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(payload)
    });
    if(res.ok) {
      document.getElementById('openTerminationModal').classList.add('hidden');
      window.fetchRefunds();
    }
  } catch(err) {
    console.error(err);
  }
});

document.getElementById('processRefundForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('processRefundId').value;
  const status = document.getElementById('refundStatus').value;
  const hash = document.getElementById('refundTxHash').value;
  try {
    const res = await fetch(`/api/admin/refunds/${id}/process`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ status, transactionHash: hash })
    });
    if(res.ok) {
      document.getElementById('processRefundModal').classList.add('hidden');
      window.fetchRefunds();
    }
  } catch(err) {
    console.error(err);
  }
});