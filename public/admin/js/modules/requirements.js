// --- Requirements Management ---
  // ==========================================
  const requirementsTableBody = document.getElementById('requirementsTableBody');
  
  window.fetchRequirements = async (page = 1) => {
    appState.reqsPage = page;
    const search = appState.reqsSearch;
    try {
      const res = await fetch(`${API_BASE}/requirements?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        allRequirements = json.data || [];
        renderRequirements(allRequirements);
        if (window.renderPagination) window.renderPagination('paginationRequirements', json, 'fetchRequirements');
      }
    } catch (err) {
      console.error('Failed to fetch Requirements', err);
    }
  };

  const renderRequirements = (reqs = allRequirements) => {
    requirementsTableBody.innerHTML = '';
    if (!reqs || reqs.length === 0) {
      requirementsTableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-500">No requirements found</td></tr>';
      return;
    }

    reqs.forEach(req => {
      const studentName = req.student ? req.student.name : 'Unknown Student';
      const studentEmail = req.student ? req.student.email : 'N/A';
      const statusBadge = req.status === 'Open' ? '<span class="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-xs">Open</span>' : 
                          req.status === 'Demo Scheduled' ? '<span class="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md text-xs">Demo Scheduled</span>' : 
                          '<span class="px-2 py-1 bg-slate-500/10 text-slate-400 rounded-md text-xs">Closed</span>';
      
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-800/50 transition-colors";
      tr.innerHTML = `
        <td class="py-4 px-4 border-b border-brand-border text-sm">
          <div class="font-medium text-white">${studentName}</div>
          <div class="text-xs text-slate-500">${studentEmail}</div>
        </td>
        <td class="py-4 px-4 border-b border-brand-border text-sm">
          <div class="font-medium text-white">${req.subject}</div>
          <div class="text-xs text-slate-500">Class ${req.classLevel} &bull; ${req.board}</div>
        </td>
        <td class="py-4 px-4 border-b border-brand-border">${statusBadge}</td>
        <td class="py-4 px-4 border-b border-brand-border text-sm text-slate-400">${new Date(req.createdAt).toLocaleDateString()}</td>
        <td class="py-4 px-4 border-b border-brand-border text-right">
          <button class="px-3 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors mr-1" onclick="closeRequirement('${req._id}')">Close</button>
          <button class="px-3 py-1 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors" onclick="deleteRequirement('${req._id}')">Delete</button>
        </td>
      `;
      requirementsTableBody.appendChild(tr);
    });
  };

  window.closeRequirement = async (id) => {
    if (confirm('Are you sure you want to close this lead?')) {
      try {
        const res = await fetch(`${API_BASE}/requirements/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({ status: 'Closed' })
        });
        if (res.ok) fetchRequirements();
        else alert('Failed to close requirement');
      } catch (err) {
        console.error(err);
      }
    }
  };

  window.deleteRequirement = async (id) => {
    if (confirm('Are you sure you want to delete this requirement? Associated bids will also be deleted.')) {
      try {
        const res = await fetch(`${API_BASE}/requirements/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
          fetchRequirements();
          if (window.fetchDashboardData) fetchDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ==========================================
  // --- Bids Management ---
  // ==========================================
  const bidsTableBody = document.getElementById('bidsTableBody');
  
  window.fetchBids = async () => {
    try {
      const res = await fetch(`${API_BASE}/bids`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const bids = await res.json();
        renderBids(bids);
      }
    } catch (err) {
      console.error('Failed to fetch Bids', err);
    }
  };

  const renderBids = (bids) => {
    bidsTableBody.innerHTML = '';
    if (!bids || bids.length === 0) {
      bidsTableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-500">No bids found</td></tr>';
      return;
    }

    bids.forEach(bid => {
      const tutorName = bid.tutor ? bid.tutor.name : 'Unknown Tutor';
      const reqInfo = bid.requirement ? `${bid.requirement.subject} (Class ${bid.requirement.classLevel})` : 'Deleted Requirement';
      const statusBadge = bid.status === 'Accepted' ? '<span class="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-xs">Accepted</span>' : 
                          bid.status === 'Rejected' ? '<span class="px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-xs">Rejected</span>' : 
                          bid.status === 'Cancelled' ? '<span class="px-2 py-1 bg-slate-500/10 text-slate-400 rounded-md text-xs">Cancelled</span>' : 
                          '<span class="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md text-xs">Pending</span>';
      
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-800/50 transition-colors";
      tr.innerHTML = `
        <td class="py-4 px-4 border-b border-brand-border text-sm font-medium text-white">${tutorName}</td>
        <td class="py-4 px-4 border-b border-brand-border text-sm text-slate-300">${reqInfo}</td>
        <td class="py-4 px-4 border-b border-brand-border text-sm text-brand font-medium">${bid.amount}</td>
        <td class="py-4 px-4 border-b border-brand-border">${statusBadge}</td>
        <td class="py-4 px-4 border-b border-brand-border text-right">
          <button class="px-3 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors mr-1" onclick="cancelBid('${bid._id}')">Cancel</button>
          <button class="px-3 py-1 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors" onclick="deleteBid('${bid._id}')">Delete</button>
        </td>
      `;
      bidsTableBody.appendChild(tr);
    });
  };

  window.cancelBid = async (id) => {
    if (confirm('Are you sure you want to cancel this bid?')) {
      try {
        const res = await fetch(`${API_BASE}/bids/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({ status: 'Cancelled' })
        });
        if (res.ok) fetchBids();
        else alert('Failed to cancel bid');
      } catch (err) {
        console.error(err);
      }
    }
  };

  window.deleteBid = async (id) => {
    if (confirm('Are you sure you want to delete this bid?')) {
      try {
        const res = await fetch(`${API_BASE}/bids/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
          fetchBids();
          if (window.fetchDashboardData) fetchDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

setTimeout(() => {
  const el = document.getElementById('searchRequirements');
  if (el) {
    let debounceTimer;
    // Overwrite oninput to prevent duplicate listeners if script runs multiple times
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.reqsSearch = e.target.value;
          window.fetchRequirements(1);
        }
      }, 400);
    };
  }
}, 200);
