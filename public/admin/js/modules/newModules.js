// Client-side logic for new modules


async function fetchmcqLogs() {
  try {
    const res = await fetch('/api/admin/mcq-logs', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('mcqLogsTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 5).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchregistrationFeeLogs() {
  try {
    const res = await fetch('/api/admin/registration-fee-logs', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('registrationFeeLogsTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 5).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchsearchAnalytics() {
  try {
    const res = await fetch('/api/admin/search-analytics', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('searchAnalyticsTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 5).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchleadConfig() {
  try {
    const res = await fetch('/api/admin/lead-config', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('leadConfigTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 3).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="3" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchdemoCancellations() {
  try {
    const res = await fetch('/api/admin/demo-cancellations', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('demoCancellationsTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 6).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchcommMasking() {
  try {
    const res = await fetch('/api/admin/comm-masking', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('commMaskingTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 6).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchchatModeration() {
  try {
    const res = await fetch('/api/admin/chat-moderation', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('chatModerationTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 6).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchdisputes() {
  try {
    const res = await fetch('/api/admin/disputes', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('disputesTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 5).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchrefunds() {
  try {
    const res = await fetch('/api/admin/refunds', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('refundsTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 5).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchtutorPerformance() {
  try {
    const res = await fetch('/api/admin/tutor-performance', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('tutorPerformanceTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 5).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchstaffRoles() {
  try {
    const res = await fetch('/api/admin/staff-roles', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
    });
    const data = await res.json();
    const tbody = document.getElementById('staffRolesTableBody');
    if (!tbody) return;
    
    if (res.ok) {
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">No records found.</td></tr>';
      } else {
        tbody.innerHTML = data.map((item, i) => {
          return '<tr class="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out ' + (i % 2 === 0 ? 'bg-slate-900/10' : '') + '">' + Object.values(item).slice(0, 5).map(v => '<td class="py-4 px-5 text-sm text-slate-300">' + (typeof v === 'object' ? JSON.stringify(v) : v) + '</td>').join('') + '</tr>';
        }).join('');
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-red-400 font-medium">Error loading data.</td></tr>';
    }
  } catch (err) {
    console.error(err);
  }
}