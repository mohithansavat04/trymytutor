// --- Demos Management ---
  // ==========================================
  const demosTableBody = document.getElementById('demosTableBody');
  
  window.fetchDemos = async (page = 1) => {
    appState.demosPage = page;
    try {
      const res = await fetch(`${API_BASE}/demos?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        renderDemos(json.data);
        if (window.renderPagination) window.renderPagination('paginationDemos', json, 'fetchDemos');
      }
    } catch (err) {
      console.error('Failed to fetch Demos', err);
    }
  };

  const renderDemos = (demos) => {
    demosTableBody.innerHTML = '';
    if (!demos || demos.length === 0) {
      demosTableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-slate-500">No scheduled demos found</td></tr>';
      return;
    }

    demos.forEach(demo => {
      const studentName = demo.student ? demo.student.name : 'Unknown';
      const tutorName = demo.tutor ? demo.tutor.name : 'Unknown';
      const reqInfo = demo.requirement ? `${demo.requirement.subject} (Class ${demo.requirement.classLevel})` : 'Deleted Req';
      const statusBadge = demo.status === 'Completed' ? '<span class="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-xs">Completed</span>' : 
                          demo.status === 'Cancelled' ? '<span class="px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-xs">Cancelled</span>' : 
                          demo.status === 'Rescheduled' ? '<span class="px-2 py-1 bg-orange-500/10 text-orange-400 rounded-md text-xs">Rescheduled</span>' : 
                          '<span class="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs">Scheduled</span>';
      
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-800/50 transition-colors";
      tr.innerHTML = `
        <td class="py-4 px-4 border-b border-brand-border text-sm font-medium text-white">${studentName}</td>
        <td class="py-4 px-4 border-b border-brand-border text-sm font-medium text-white">${tutorName}</td>
        <td class="py-4 px-4 border-b border-brand-border text-sm text-slate-300">${reqInfo}</td>
        <td class="py-4 px-4 border-b border-brand-border text-sm text-slate-400">${new Date(demo.scheduledAt).toLocaleString()}</td>
        <td class="py-4 px-4 border-b border-brand-border">${statusBadge}</td>
        <td class="py-4 px-4 border-b border-brand-border text-right">
          <button class="px-2 py-1 text-xs font-medium bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors mr-1" onclick="updateDemoStatus('${demo._id}', 'Completed')">Complete</button>
          <button class="px-2 py-1 text-xs font-medium bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded transition-colors mr-1" onclick="updateDemoStatus('${demo._id}', 'Rescheduled')">Reschedule</button>
          <button class="px-2 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors mr-1" onclick="updateDemoStatus('${demo._id}', 'Cancelled')">Cancel</button>
          <button class="px-2 py-1 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors" onclick="deleteDemo('${demo._id}')">Delete</button>
        </td>
      `;
      demosTableBody.appendChild(tr);
    });
  };

  window.updateDemoStatus = async (id, status) => {
    if (confirm(`Change demo status to ${status}?`)) {
      try {
        const res = await fetch(`${API_BASE}/demos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({ status })
        });
        if (res.ok) fetchDemos(appState.demosPage);
        else alert('Failed to update demo status');
      } catch (err) {
        console.error(err);
      }
    }
  };

  window.deleteDemo = async (id) => {
    if (confirm('Are you sure you want to delete this demo?')) {
      try {
        const res = await fetch(`${API_BASE}/demos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
          fetchDemos();
          if (window.fetchDashboardData) fetchDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
