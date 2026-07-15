// --- Tutor Approvals Management ---
  // ==========================================
  const tutorApprovalsTableBody = document.getElementById('tutorApprovalsTableBody');
  let currentTutors = [];

  window.fetchTutorApprovals = async (page = 1) => {
    appState.tutorsPage = page;
    const search = appState.tutorsSearch;
    try {
      const res = await fetch(`${API_BASE}/tutor-approvals?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        currentTutors = json.tutors ? (json.tutors.data || []) : (json.data || []);
        renderTutorApprovals(currentTutors);
        if (window.renderPagination) window.renderPagination('paginationTutors', json.tutors || json, 'fetchTutorApprovals');
      }
    } catch (err) {
      console.error('Failed to fetch tutor approvals', err);
    }
  };

  const renderTutorApprovals = (tutors) => {
    tutorApprovalsTableBody.innerHTML = '';
    if (!tutors || tutors.length === 0) {
      tutorApprovalsTableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-500">No tutors found</td></tr>';
      return;
    }

    tutors.forEach(tutor => {
      const tutorLocation = tutor.location || tutor.address || 'Unknown';
      const tutorExp = tutor.experience ? `${tutor.experience} yrs` : '0 yrs';
      
      let stateBadge = '';
      if (tutor.tutorState === 'Interview pending') {
        stateBadge = '<span class="px-2 py-1 bg-orange-500/10 text-orange-400 rounded-md text-xs font-semibold">Interview pending</span>';
      } else if (tutor.tutorState === 'Live') {
        stateBadge = '<span class="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-xs font-semibold">Live</span>';
      } else if (tutor.tutorState === 'In-house') {
        stateBadge = '<span class="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs font-semibold">In-house</span>';
      } else if (tutor.tutorState === 'Suspended' || tutor.tutorState === 'MCQ Failed') {
        stateBadge = `<span class="px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-xs font-semibold">${tutor.tutorState}</span>`;
      } else {
      }
      
      actionsHtml += `
        <button class="px-2 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 mr-1" onclick="viewTutorDetails('${tutor._id}')">View</button>
        <button class="px-2 py-1 text-xs font-semibold text-orange-400 hover:text-orange-300 mr-1" onclick="editTutor('${tutor._id}')">Edit</button>
        <button class="px-2 py-1 text-xs font-semibold text-red-400 hover:text-red-300" onclick="deleteTutor('${tutor._id}')">Delete</button>
      `;

      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-800/30 transition-colors border-b border-brand-border last:border-0";
      tr.innerHTML = `
        <td class="py-4 px-4 text-sm">
          <div class="font-bold text-white">${tutor.name}</div>
          <div class="text-xs text-slate-500 mt-1">${tutorLocation} &bull; ${tutorExp}</div>
        </td>
        <td class="py-4 px-4 text-sm text-slate-300">${tutor.subjects || 'N/A'}</td>
        <td class="py-4 px-4 text-sm font-medium text-slate-300">${tutor.mcqScore || 'N/A'}</td>
        <td class="py-4 px-4">${stateBadge}</td>
        <td class="py-4 px-4 text-center whitespace-nowrap">${actionsHtml}</td>
      `;
      tutorApprovalsTableBody.appendChild(tr);
    });
  };

  window.updateTutorState = async (id, action) => {
    try {
      const res = await fetch(`${API_BASE}/tutors/${id}/state`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchTutorApprovals();
      } else {
        alert('Failed to update tutor state');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // --- Add New Tutor Modal Logic ---
  // ==========================================
  const addTutorModal = document.getElementById('addTutorModal');
  const closeAddTutorModalBtn = document.getElementById('closeAddTutorModal');
  const cancelAddTutorBtn = document.getElementById('cancelAddTutorBtn');
  const addTutorForm = document.getElementById('addTutorForm');

  const openTutorModal = () => {
    if (addTutorForm) {
      addTutorForm.reset();
      document.getElementById('formTutorId').value = '';
      document.getElementById('addTutorSubmitBtn').textContent = 'Create Tutor Profile';
      // Reset availability
      document.getElementById('tutorAvailability').value = '';
      document.getElementById('availabilityDisplay').textContent = 'Click to set weekly schedule...';
    }
    if (addTutorModal) addTutorModal.classList.add('active');
  };

  // The header button (openAddTutorModalBtn) is declared at top of file
  if (openAddTutorModalBtn) {
    openAddTutorModalBtn.addEventListener('click', openTutorModal);
  }

  const closeTutorModal = () => { if (addTutorModal) addTutorModal.classList.remove('active'); };
  if (closeAddTutorModalBtn) closeAddTutorModalBtn.addEventListener('click', closeTutorModal);
  if (cancelAddTutorBtn) cancelAddTutorBtn.addEventListener('click', closeTutorModal);

  if (addTutorForm) {
    addTutorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const phoneInput = document.getElementById('tutorPhone').value;
      if (phoneInput && !/^\d{10}$/.test(phoneInput)) {
        alert('Phone number must be exactly 10 digits.');
        return;
      }

      const id = document.getElementById('formTutorId').value;
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/users/${id}` : `${API_BASE}/users`;

      const payload = {
        role: 'Tutor',
        status: 'Active',
        tutorState: id ? undefined : 'Interview pending', // only set on create
        name: document.getElementById('tutorName').value,
        email: document.getElementById('tutorEmail').value,
        phone: document.getElementById('tutorPhone').value,
        subjects: document.getElementById('tutorSubjects').value,
        experience: document.getElementById('tutorExperience').value,
        address: document.getElementById('tutorLocation').value,
        radius: document.getElementById('tutorRadius').value,
        hourlyRate: document.getElementById('tutorRate').value,
        availabilityGrid: document.getElementById('tutorAvailability').value,
        notifications: document.getElementById('tutorNotifications').checked
      };

      try {
        const res = await fetch(url, {
          method: method,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          closeTutorModal();
          fetchTutorApprovals(); // Tutor appears immediately in the pipeline
          fetchMetrics();        // Update dashboard counters
        } else {
          const errData = await res.json();
          alert(errData.message || 'Error saving tutor');
        }
      } catch (err) {
        console.error(err);
        alert('Network error');
      }
    });
  }

  window.deleteTutor = async (id) => {
    if (confirm('Are you sure you want to delete this tutor?')) {
      try {
        const res = await fetch(`${API_BASE}/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
          fetchTutorApprovals();
          fetchMetrics();
        } else {
          alert('Failed to delete tutor');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  window.editTutor = (id) => {
    const tutor = currentTutors.find(t => t._id === id);
    if (!tutor) return;
    
    document.getElementById('formTutorId').value = tutor._id;
    document.getElementById('tutorName').value = tutor.name || '';
    document.getElementById('tutorEmail').value = tutor.email || '';
    document.getElementById('tutorPhone').value = tutor.phone || '';
    document.getElementById('tutorSubjects').value = tutor.subjects || '';
    document.getElementById('tutorExperience').value = tutor.experience || 0;
    document.getElementById('tutorLocation').value = tutor.location || tutor.address || '';
    document.getElementById('tutorRadius').value = tutor.radius || 5;
    document.getElementById('tutorRate').value = tutor.hourlyRate || 450;
    document.getElementById('tutorNotifications').checked = tutor.notifications !== false;
    
    const grid = tutor.availabilityGrid || '';
    if (window.updateScheduleState) {
      window.updateScheduleState(grid);
    } else {
      document.getElementById('tutorAvailability').value = grid;
    }

    document.getElementById('addTutorSubmitBtn').textContent = 'Save Changes';
    if (addTutorModal) addTutorModal.classList.add('active');
  };

  window.viewTutorDetails = (id) => {
    const tutor = currentTutors.find(t => t._id === id);
    if (!tutor) return;

    document.getElementById('dtName').textContent = tutor.name || '-';
    document.getElementById('dtEmail').textContent = tutor.email || '-';
    document.getElementById('dtPhone').textContent = tutor.phone || '-';
    document.getElementById('dtStatus').innerHTML = tutor.tutorState === 'Live' 
      ? '<span class="text-green-400">Live</span>' 
      : `<span class="text-orange-400">${tutor.tutorState || 'Pending'}</span>`;
    document.getElementById('dtSubjects').textContent = tutor.subjects || '-';
    document.getElementById('dtExperience').textContent = tutor.experience ? `${tutor.experience} Years` : '-';
    document.getElementById('dtLocation').textContent = tutor.location || tutor.address || '-';
    document.getElementById('dtRate').textContent = tutor.hourlyRate ? `₹${tutor.hourlyRate}/hr` : '-';
    document.getElementById('dtJoined').textContent = tutor.createdAt ? new Date(tutor.createdAt).toLocaleDateString() : '-';

    const schedContainer = document.getElementById('dtSchedule');
    schedContainer.innerHTML = '';
    
    if (tutor.availabilityGrid && tutor.availabilityGrid.length > 5) {
      try {
        const grid = JSON.parse(tutor.availabilityGrid);
        let hasSlots = false;
        Object.keys(grid).forEach(day => {
          if (grid[day] && grid[day].length > 0) {
            hasSlots = true;
            const slotsHtml = grid[day].map(s => `<span class="inline-block px-2 py-1 bg-slate-800 text-xs rounded text-slate-300 mr-2 mb-1">${s.start} - ${s.end}</span>`).join('');
            schedContainer.innerHTML += `
              <div class="flex items-start border-b border-slate-700/50 pb-2 last:border-0 last:pb-0 mb-2 last:mb-0">
                <div class="w-24 text-sm font-semibold text-brand capitalize pt-1">${day}</div>
                <div class="flex-1 flex flex-wrap">${slotsHtml}</div>
              </div>
            `;
          }
        });
        if (!hasSlots) {
          schedContainer.innerHTML = '<div class="text-sm text-slate-500">No availability set</div>';
        }
      } catch (e) {
        schedContainer.innerHTML = '<div class="text-sm text-slate-500">Invalid schedule data</div>';
      }
    } else {
      schedContainer.innerHTML = '<div class="text-sm text-slate-500">No availability set</div>';
    }

    document.getElementById('viewTutorDetailsModal').classList.add('active');
  };

  const closeViewTutorDetailsModalBtn = document.getElementById('closeViewTutorDetailsModal');
  if (closeViewTutorDetailsModalBtn) {
    closeViewTutorDetailsModalBtn.addEventListener('click', () => {
      document.getElementById('viewTutorDetailsModal').classList.remove('active');
    });
  }

  // ==========================================
  // --- Weekly Availability Scheduler ---
  // ==========================================
  (function initAvailabilityScheduler() {
    const trigger    = document.getElementById('availabilityTrigger');
    const popup      = document.getElementById('availabilityPopup');
    const doneBtn    = document.getElementById('availabilityDoneBtn');
    const display    = document.getElementById('availabilityDisplay');
    const hiddenInput= document.getElementById('tutorAvailability');
    const rowsContainer = document.getElementById('scheduleRows');

    if (!trigger || !popup || !rowsContainer) return;

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Build hour options 6 AM – 11 PM in 30-min increments
    const timeOptions = [];
    for (let h = 6; h <= 23; h++) {
      ['00', '30'].forEach(m => {
        const hour24 = `${String(h).padStart(2,'0')}:${m}`;
        const amPm   = h < 12 ? 'AM' : 'PM';
        const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const label  = `${h12}:${m} ${amPm}`;
        timeOptions.push({ value: hour24, label });
      });
    }
    timeOptions.push({ value: '23:30', label: '11:30 PM' });
    const uniqueTimes = timeOptions.filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);

    function buildOptions(defaultVal) {
      return uniqueTimes.map(t => `<option value="${t.value}" ${t.value === defaultVal ? 'selected' : ''}>${t.label}</option>`).join('');
    }

    // State: { Monday: [{ start: '16:00', end: '19:00' }], ... }
    let state = {};
    DAYS.forEach(d => state[d] = []);

    window.updateScheduleState = (newStateStr) => {
      if (!newStateStr) {
        DAYS.forEach(d => state[d] = []);
      } else {
        try {
          const parsed = JSON.parse(newStateStr);
          DAYS.forEach(d => {
            state[d] = Array.isArray(parsed[d]) ? parsed[d] : (parsed[d] ? [{start: parsed[d].from, end: parsed[d].to}] : []);
          });
        } catch (e) {
          DAYS.forEach(d => state[d] = []);
        }
      }
      renderRows();
      updateSummary();
    };

    function renderRows() {
      rowsContainer.innerHTML = '';
      DAYS.forEach((day, idx) => {
        const row = document.createElement('div');
        row.className = 'flex flex-col gap-2 transition-all p-2 rounded-lg border border-transparent hover:border-slate-700/50 hover:bg-slate-800/30';
        
        // Header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center';
        
        const dayLabel = document.createElement('div');
        dayLabel.className = 'text-sm font-semibold text-white';
        dayLabel.textContent = day;

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'text-xs text-brand hover:text-orange-400 font-medium px-2 py-1 rounded bg-brand/10 hover:bg-brand/20 transition-colors';
        addBtn.textContent = '+ Add Slot';
        addBtn.onclick = () => {
          state[day].push({ start: '16:00', end: '19:00' });
          renderRows();
          updateSummary();
        };

        header.appendChild(dayLabel);
        header.appendChild(addBtn);
        row.appendChild(header);

        // Slots
        if (state[day].length === 0) {
          const empty = document.createElement('div');
          empty.className = 'text-xs text-slate-500 italic';
          empty.textContent = 'No slots added';
          row.appendChild(empty);
        } else {
          state[day].forEach((slot, sIdx) => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'flex items-center gap-2';
            
            const fromSel = document.createElement('select');
            fromSel.className = 'flex-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-brand appearance-none cursor-pointer';
            fromSel.innerHTML = buildOptions(slot.start);
            fromSel.onchange = (e) => { slot.start = e.target.value; updateSummary(); };

            const toText = document.createElement('span');
            toText.className = 'text-slate-500 text-xs';
            toText.textContent = 'to';

            const toSel = document.createElement('select');
            toSel.className = 'flex-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-brand appearance-none cursor-pointer';
            toSel.innerHTML = buildOptions(slot.end);
            toSel.onchange = (e) => { slot.end = e.target.value; updateSummary(); };

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'text-slate-500 hover:text-red-400 p-1';
            delBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            delBtn.onclick = () => {
              state[day].splice(sIdx, 1);
              renderRows();
              updateSummary();
            };

            slotDiv.appendChild(fromSel);
            slotDiv.appendChild(toText);
            slotDiv.appendChild(toSel);
            slotDiv.appendChild(delBtn);
            row.appendChild(slotDiv);
          });
        }
        
        rowsContainer.appendChild(row);
      });
    }

    function fmt12(t) {
      if(!t) return '';
      const [h, m] = t.split(':').map(Number);
      const amPm = h < 12 ? 'AM' : 'PM';
      const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${String(m).padStart(2,'0')} ${amPm}`;
    }

    function updateSummary() {
      const activeDays = DAYS.filter(d => state[d].length > 0);
      if (activeDays.length === 0) {
        display.textContent = 'Click to set weekly schedule...';
        display.classList.add('text-slate-400');
        display.classList.remove('text-white');
        if (hiddenInput) hiddenInput.value = '';
        return;
      }
      
      const parts = activeDays.map(d => {
        const abbr = DAY_ABBR[DAYS.indexOf(d)];
        return `${abbr} (${state[d].length} slots)`;
      });
      display.textContent = parts.join(', ');
      display.classList.remove('text-slate-400');
      display.classList.add('text-white');

      const json = {};
      activeDays.forEach(d => { json[d] = state[d]; });
      if (hiddenInput) hiddenInput.value = JSON.stringify(json);
    }

    // Initialize UI
    renderRows();

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.toggle('hidden');
    });

    doneBtn.addEventListener('click', () => {
      popup.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
      const wrapper = document.getElementById('availabilityWrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        popup.classList.add('hidden');
      }
    });

    const addTutorFormEl = document.getElementById('addTutorForm');
    if (addTutorFormEl) {
      addTutorFormEl.addEventListener('reset', () => {
        setTimeout(() => {
           window.updateScheduleState('');
        }, 10);
      });
    }
  })();
  // ==========================================
  // --- Settings & Roles Management ---
  
  let allRoles = [];

  window.fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        allRoles = await res.json();
        renderRoles(allRoles);
        populateRoleDropdowns(allRoles);
      }
    } catch (err) { console.error(err); }
  };

  const renderRoles = (roles) => {
    const list = document.getElementById('rolesList');
    if (!list) return;
    if (roles.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-slate-500">No roles found</div>`;
      return;
    }
    let html = `<table class="w-full text-left border-collapse">
                  <tbody class="divide-y divide-brand-border">`;
    roles.forEach(r => {
      html += `
        <tr class="hover:bg-slate-800/50 transition-colors">
          <td class="p-4 w-1/2">
            <div class="font-medium text-white">${r.name}</div>
          </td>
          <td class="p-4 w-1/4 text-slate-300">
            ${r.permissions.length} selected
          </td>
          <td class="p-4 w-1/4 text-right">
            <button onclick="window.openEditRole('${r._id}')" class="text-xs bg-slate-700 hover:bg-slate-600 text-white py-1 px-3 rounded-lg transition-colors mr-2">Edit</button>
            ${!r.isSystem ? `<button onclick="window.deleteRole('${r._id}')" class="text-xs bg-red-900/50 hover:bg-red-900 text-red-200 py-1 px-3 rounded-lg transition-colors">Delete</button>` : ''}
          </td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
    list.innerHTML = html;
  };

  const populateRoleDropdowns = (roles) => {
    const editSelect = document.getElementById('editAccessRole');
    const newSelect = document.getElementById('newMemberRole');
    const html = roles.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
    if (editSelect) editSelect.innerHTML = html;
    if (newSelect) newSelect.innerHTML = html;
  };

  window.fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (document.getElementById('setBatchSize')) document.getElementById('setBatchSize').value = data.batchSize;
          if (document.getElementById('setBatchInterval')) document.getElementById('setBatchInterval').value = data.batchInterval;
          if (document.getElementById('setAutoBidDelay')) document.getElementById('setAutoBidDelay').value = data.autoBidDelay;
          if (document.getElementById('setConcurrentCap')) document.getElementById('setConcurrentCap').value = data.concurrentDemoCap;
          if (document.getElementById('setRescheduleCutoff')) document.getElementById('setRescheduleCutoff').value = data.rescheduleCutoff;
        }
      }
    } catch (err) { console.error('Failed to fetch settings', err); }
  };

  const saveSettings = async () => {
    const payload = {
      batchSize: parseInt(document.getElementById('stgBatchSize').value) || 10,
      batchInterval: document.getElementById('stgBatchInterval').value,
      autoBidDelay: document.getElementById('stgAutoBidDelay').value,
      concurrentDemoCap: parseInt(document.getElementById('stgConcurrentDemoCap').value) || 5,
      rescheduleCutoff: document.getElementById('stgRescheduleCutoff').value
    };
    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  // Auto-save on blur or change
  ['stgBatchSize', 'stgBatchInterval', 'stgAutoBidDelay', 'stgConcurrentDemoCap', 'stgRescheduleCutoff'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', saveSettings);
  });

  window.fetchTeamMembers = async () => {
    fetchRoles(); // fetch roles at the same time to populate dropdowns
    try {
      const res = await fetch(`${API_BASE}/team`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const team = await res.json();
        const tbody = document.getElementById('teamTableBody');
        tbody.innerHTML = '';
        team.forEach(admin => {
          let badgeColor = admin.role === 'Admin' ? 'text-blue-400' :
                           admin.role === 'Support' ? 'text-green-400' :
                           admin.role === 'Super Admin' ? 'text-orange-400' :
                           'text-slate-300';
                           
          let roleDisplay = admin.role === 'Finance Phase 2' 
            ? 'Finance <span class="ml-2 px-2 py-0.5 bg-slate-800 text-[10px] text-slate-500 rounded-md">Phase 2</span>'
            : admin.role;
            
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-slate-800/30 transition-colors';
          tr.innerHTML = `
            <td class="py-4 px-6 text-sm font-medium text-white w-1/2">${admin.email}</td>
            <td class="py-4 px-6 text-sm ${badgeColor} font-medium w-1/4">${roleDisplay}</td>
            <td class="py-4 px-6 text-right w-1/4">
              <button class="px-4 py-1.5 text-xs font-semibold bg-slate-800 border border-brand-border text-slate-300 hover:text-white rounded-full transition-colors" onclick="openEditAccess('${admin._id}', '${admin.role}')">
                Edit access
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error('Failed to fetch team members', err);
    }
  };

  const editAccessModal = document.getElementById('editAccessModal');
  const closeEditAccessModal = document.getElementById('closeEditAccessModal');
  const cancelEditAccessBtn = document.getElementById('cancelEditAccessBtn');
  const editAccessForm = document.getElementById('editAccessForm');

  const addTeamMemberModal = document.getElementById('addTeamMemberModal');
  const openAddTeamMemberBtn = document.getElementById('openAddTeamMemberBtn');
  const closeAddTeamMemberModal = document.getElementById('closeAddTeamMemberModal');
  const cancelAddTeamMemberBtn = document.getElementById('cancelAddTeamMemberBtn');
  const addTeamMemberForm = document.getElementById('addTeamMemberForm');

  window.openEditAccess = (id, currentRole) => {
    document.getElementById('editAccessAdminId').value = id;
    document.getElementById('editAccessRole').value = currentRole;
    editAccessModal.classList.add('active');
  };

  const closeAccessModal = () => editAccessModal.classList.remove('active');
  if (closeEditAccessModal) closeEditAccessModal.addEventListener('click', closeAccessModal);
  if (cancelEditAccessBtn) cancelEditAccessBtn.addEventListener('click', closeAccessModal);

  const closeAddMemberModal = () => addTeamMemberModal.classList.remove('active');
  if (openAddTeamMemberBtn) openAddTeamMemberBtn.addEventListener('click', () => {
    addTeamMemberForm.reset();
    addTeamMemberModal.classList.add('active');
  });
  if (closeAddTeamMemberModal) closeAddTeamMemberModal.addEventListener('click', closeAddMemberModal);
  if (cancelAddTeamMemberBtn) cancelAddTeamMemberBtn.addEventListener('click', closeAddMemberModal);

  if (addTeamMemberForm) {
    addTeamMemberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('newMemberEmail').value;
      const password = document.getElementById('newMemberPassword').value;
      const role = document.getElementById('newMemberRole').value;

      try {
        const res = await fetch(`${API_BASE}/team`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}` 
          },
          body: JSON.stringify({ email, password, role })
        });
        if (res.ok) {
          closeAddMemberModal();
          fetchTeamMembers();
        } else {
          const errData = await res.json();
          alert(errData.message || 'Error adding team member');
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  if (editAccessForm) {
    editAccessForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editAccessAdminId').value;
      const role = document.getElementById('editAccessRole').value;
      try {
        const res = await fetch(`${API_BASE}/team/${id}/role`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}` 
          },
          body: JSON.stringify({ role })
        });
        if (res.ok) {
          closeAccessModal();
          fetchTeamMembers();
        } else {
          const errData = await res.json();
          alert(errData.message || 'Error updating role');
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  const roleModal = document.getElementById('roleModal');
  const roleForm = document.getElementById('roleForm');
  const openAddRoleBtn = document.getElementById('openAddRoleBtn');
  const closeRoleModalBtn = document.getElementById('closeRoleModalBtn');
  const cancelRoleBtn = document.getElementById('cancelRoleBtn');
  const roleModalTitle = document.getElementById('roleModalTitle');

  const closeRoleMod = () => roleModal.classList.remove('active');
  if (closeRoleModalBtn) closeRoleModalBtn.addEventListener('click', closeRoleMod);
  if (cancelRoleBtn) cancelRoleBtn.addEventListener('click', closeRoleMod);

  if (openAddRoleBtn) openAddRoleBtn.addEventListener('click', () => {
    roleForm.reset();
    document.getElementById('roleId').value = '';
    roleModalTitle.textContent = 'Add Role';
    document.querySelectorAll('.permission-checkbox').forEach(cb => cb.checked = false);
    roleModal.classList.add('active');
  });

  window.openEditRole = (id) => {
    const role = allRoles.find(r => r._id === id);
    if (!role) return;
    roleForm.reset();
    document.getElementById('roleId').value = role._id;
    document.getElementById('roleName').value = role.name;
    roleModalTitle.textContent = 'Edit Role';
    document.querySelectorAll('.permission-checkbox').forEach(cb => {
      cb.checked = role.permissions.includes(cb.value);
    });
    roleModal.classList.add('active');
  };

  window.deleteRole = async (id) => {
    if(!confirm('Are you sure you want to delete this role?')) return;
    try {
      const res = await fetch(`${API_BASE}/roles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        fetchRoles();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error deleting role');
      }
    } catch (err) { console.error(err); }
  };

  if (roleForm) {
    roleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('roleId').value;
      const name = document.getElementById('roleName').value;
      const permissions = Array.from(document.querySelectorAll('.permission-checkbox:checked')).map(cb => cb.value);

      const url = id ? `${API_BASE}/roles/${id}` : `${API_BASE}/roles`;
      const method = id ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}` 
          },
          body: JSON.stringify({ name, permissions })
        });
        if (res.ok) {
          closeRoleMod();
          fetchRoles();
        } else {
          const errData = await res.json();
          alert(errData.message || 'Error saving role');
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  // ==========================================
  // --- New Dynamic Modules ---
  // ==========================================

  window.fetchCalendars = async () => {
    try {
      const res = await fetch(`${API_BASE}/schedules`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        const container = document.getElementById('calendarsContent').querySelector('.text-center');
        if (data.length === 0) {
          container.innerHTML = '<p class="text-slate-500">No schedules found.</p>';
        } else {
          let html = `<table class="w-full text-left mt-4"><thead class="text-xs uppercase bg-slate-800 text-slate-400"><tr><th class="px-4 py-3">Date</th><th class="px-4 py-3">Time</th><th class="px-4 py-3">Status</th></tr></thead><tbody class="divide-y divide-slate-800">`;
          data.forEach(s => {
            html += `<tr class="hover:bg-slate-800/50"><td class="px-4 py-3 text-sm text-white">${new Date(s.date).toLocaleDateString()}</td><td class="px-4 py-3 text-sm text-slate-300">${s.startTime} - ${s.endTime}</td><td class="px-4 py-3 text-sm"><span class="px-2 py-1 bg-brand/10 text-brand rounded">${s.status}</span></td></tr>`;
          });
          html += `</tbody></table>`;
          container.innerHTML = html;
        }
      }
    } catch (err) {
      console.error('Failed to fetch schedules', err);
    }
  };

  window.fetchFinance = async () => {
    try {
      const txRes = await fetch(`${API_BASE}/transactions`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const payoutRes = await fetch(`${API_BASE}/payouts`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      
      if (txRes.ok && payoutRes.ok) {
        const txData = await txRes.json();
        const payoutData = await payoutRes.json();
        
        const container = document.getElementById('financeContent').querySelector('.border-dashed');
        if (txData.length === 0 && payoutData.length === 0) {
          container.innerHTML = '<p class="text-slate-500">No transactions or payouts found.</p>';
        } else {
          let html = `<h3 class="text-lg font-bold text-white mb-2">Transactions</h3><table class="w-full text-left mb-8"><thead class="text-xs uppercase bg-slate-800 text-slate-400"><tr><th class="px-4 py-3">Amount</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Purpose</th><th class="px-4 py-3">Status</th></tr></thead><tbody class="divide-y divide-slate-800">`;
          txData.forEach(tx => {
            html += `<tr class="hover:bg-slate-800/50"><td class="px-4 py-3 text-sm text-white">₹${tx.amount}</td><td class="px-4 py-3 text-sm text-slate-300">${tx.type}</td><td class="px-4 py-3 text-sm text-slate-300">${tx.purpose}</td><td class="px-4 py-3 text-sm"><span class="px-2 py-1 bg-green-500/10 text-green-400 rounded">${tx.status}</span></td></tr>`;
          });
          html += `</tbody></table>`;
          
          html += `<h3 class="text-lg font-bold text-white mb-2">Payout Requests</h3><table class="w-full text-left"><thead class="text-xs uppercase bg-slate-800 text-slate-400"><tr><th class="px-4 py-3">Amount</th><th class="px-4 py-3">Bank Details</th><th class="px-4 py-3">Status</th></tr></thead><tbody class="divide-y divide-slate-800">`;
          payoutData.forEach(p => {
            html += `<tr class="hover:bg-slate-800/50"><td class="px-4 py-3 text-sm text-white">₹${p.amount}</td><td class="px-4 py-3 text-sm text-slate-400">${p.bankDetails ? p.bankDetails.bankName : 'N/A'}</td><td class="px-4 py-3 text-sm"><span class="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded">${p.status}</span></td></tr>`;
          });
          html += `</tbody></table>`;
          
          container.className = 'w-full';
          container.innerHTML = html;
        }
      }
    } catch (err) {
      console.error('Failed to fetch finance data', err);
    }
  };

  window.fetchSupport = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        const container = document.getElementById('supportContent').querySelector('.border-dashed');
        if (data.length === 0) {
          container.innerHTML = '<p class="text-slate-500">No support tickets found.</p>';
        } else {
          let html = `<table class="w-full text-left mt-4"><thead class="text-xs uppercase bg-slate-800 text-slate-400"><tr><th class="px-4 py-3">Subject</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Priority</th><th class="px-4 py-3">Status</th></tr></thead><tbody class="divide-y divide-slate-800">`;
          data.forEach(t => {
            html += `<tr class="hover:bg-slate-800/50"><td class="px-4 py-3 text-sm text-white font-medium">${t.subject}</td><td class="px-4 py-3 text-sm text-slate-300">${t.type}</td><td class="px-4 py-3 text-sm text-red-400">${t.priority}</td><td class="px-4 py-3 text-sm"><span class="px-2 py-1 bg-blue-500/10 text-blue-400 rounded">${t.status}</span></td></tr>`;
          });
          html += `</tbody></table>`;
          container.className = 'w-full';
          container.innerHTML = html;
        }
      }
    } catch (err) {
      console.error('Failed to fetch support tickets', err);
    }
  };

  window.fetchCms = async () => {
    try {
      const res = await fetch(`${API_BASE}/cms`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        const container = document.getElementById('cmsContent').querySelector('.border-dashed');
        if (data.length === 0) {
          container.innerHTML = '<p class="text-slate-500">No CMS pages found.</p>';
        } else {
          let html = `<table class="w-full text-left mt-4"><thead class="text-xs uppercase bg-slate-800 text-slate-400"><tr><th class="px-4 py-3">Title</th><th class="px-4 py-3">Slug</th><th class="px-4 py-3">Status</th></tr></thead><tbody class="divide-y divide-slate-800">`;
          data.forEach(c => {
            html += `<tr class="hover:bg-slate-800/50"><td class="px-4 py-3 text-sm text-white font-medium">${c.title}</td><td class="px-4 py-3 text-sm text-slate-400">/${c.slug}</td><td class="px-4 py-3 text-sm"><span class="px-2 py-1 bg-brand/10 text-brand rounded">${c.status}</span></td></tr>`;
          });
          html += `</tbody></table>`;
          container.className = 'w-full';
          container.innerHTML = html;
        }
      }
    } catch (err) {
      console.error('Failed to fetch CMS pages', err);
    }
  };



  

setTimeout(() => {
  const el = document.getElementById('searchTutors');
  if (el) {
    let debounceTimer;
    // Overwrite oninput to prevent duplicate listeners if script runs multiple times
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.tutorsSearch = e.target.value;
          window.fetchTutorApprovals(1);
        }
      }, 400);
    };
  }
}, 200);
