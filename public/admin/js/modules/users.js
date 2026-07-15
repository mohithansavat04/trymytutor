// --- Students / Parents Management (role = 'Student / Parent' only) ---
  window.fetchStudents = async (page = 1) => {
    appState.studentsPage = page;
    const search = appState.studentsSearch;
    try {
      const res = await fetch(`${API_BASE}/users?page=${page}&limit=10&search=${encodeURIComponent(search)}&role=Student / Parent`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        allUsers = json.data || [];
        renderUsers(allUsers);
        if (window.renderPagination) window.renderPagination('paginationUsers', json, 'fetchStudents');
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  // Keep fetchUsers as an alias for compatibility
  const fetchUsers = fetchStudents;

  const getRoleBadge = (role) => {
    if (role === 'Student / Parent') return '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">Student / Parent</span>';
    if (role === 'Tutor') return '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30">Tutor</span>';
    return `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">${role}</span>`;
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') return '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30">Active</span>';
    if (status === 'Pending') return '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">Pending</span>';
    return '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">Suspended</span>';
  };

  const renderUsers = (usersToRender) => {
    userTableBody.innerHTML = '';
    
    if (!usersToRender || !Array.isArray(usersToRender)) return;

    usersToRender.forEach(user => {
      try {
        // Safe fallbacks
        const safeName = user.name || 'Unknown User';
        const safeId = user._id ? user._id.toString() : '000000';
        const displayId = safeId.length > 6 ? safeId.substring(safeId.length - 6) : safeId;
        const safeRole = user.role || 'User';
        const safeStatus = user.status || 'Active';
        const safeEmail = user.email || 'No email';
        const safePhone = user.phone || 'No phone';

        // Generate initials safely
        const initials = safeName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
        
        // Generate a color based on the role
        const avatarBg = safeRole === 'Tutor' ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-blue-400 to-blue-600';

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 transition-colors group";
        tr.innerHTML = `
          <td class="py-4 px-4 border-b border-brand-border">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-black/20 mr-4 border-2 border-slate-700 group-hover:scale-105 transition-transform">
                ${initials}
              </div>
              <div>
                <div class="font-semibold text-white group-hover:text-brand transition-colors">${safeName}</div>
                <div class="text-xs text-slate-500 mt-0.5">ID: ${displayId}</div>
              </div>
            </div>
          </td>
          <td class="py-4 px-4 border-b border-brand-border">
            <div class="text-sm text-slate-300 font-medium">${safeEmail}</div>
            <div class="text-xs text-slate-500 mt-1 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              ${safePhone}
            </div>
          </td>
          <td class="py-4 px-4 border-b border-brand-border">${getRoleBadge(safeRole)}</td>
          <td class="py-4 px-4 border-b border-brand-border">${getStatusBadge(safeStatus)}</td>
          <td class="py-4 px-4 border-b border-brand-border text-right space-x-2">
            <button class="px-3 py-1.5 text-xs font-medium bg-slate-700/50 hover:bg-slate-700 text-white rounded-md transition-colors" onclick="viewUser('${safeId}')">View</button>
            <button class="px-3 py-1.5 text-xs font-medium bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 rounded-md transition-colors" onclick="openEditModal('${safeId}')">Edit</button>
            <button class="px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md transition-colors" onclick="deleteUser('${safeId}')">Del</button>
          </td>
        `;
        userTableBody.appendChild(tr);
      } catch (err) {
        console.error('Error rendering user row:', err, user);
      }
    });
  };

  // --- Filtering & Search (students only) ---
  

  

  // --- Modals Logic ---
  
  // Add User
  openAddUserModal.addEventListener('click', () => {
    userForm.reset();
    formUserId.value = '';
    modalTitle.textContent = 'Add New Student / Parent';
    statusGroup.style.display = 'none';
    // Always Student / Parent from this form
    if (formRole) formRole.value = 'Student / Parent';
    userFormModal.classList.add('active');
  });

  // Close Modals
  const closeModals = () => {
    userFormModal.classList.remove('active');
    viewDetailsModal.classList.remove('active');
  };
  closeUserFormModal.addEventListener('click', closeModals);
  cancelFormBtn.addEventListener('click', closeModals);
  closeViewDetailsModal.addEventListener('click', closeModals);

  // Edit User
  window.openEditModal = (id) => {
    const user = allUsers.find(u => u._id === id);
    if (!user) return;

    formUserId.value = user._id;
    formName.value = user.name;
    formEmail.value = user.email;
    formRole.value = user.role;
    formStatus.value = user.status;
    formPhone.value = user.phone || '';
    formSubjects.value = user.subjects || '';
    formAddress.value = user.address || '';
    
    modalTitle.textContent = 'Edit User';
    statusGroup.style.display = 'block'; 
    userFormModal.classList.add('active');
  };

  // View Details
  window.viewUser = (id) => {
    const user = allUsers.find(u => u._id === id);
    if (!user) return;

    document.getElementById('detailId').textContent = user._id;
    document.getElementById('detailName').textContent = user.name;
    document.getElementById('detailEmail').textContent = user.email;
    document.getElementById('detailPhone').textContent = user.phone || 'N/A';
    document.getElementById('detailRole').innerHTML = getRoleBadge(user.role);
    document.getElementById('detailSubjects').textContent = user.subjects || 'N/A';
    document.getElementById('detailAddress').textContent = user.address || 'N/A';
    document.getElementById('detailStatus').innerHTML = getStatusBadge(user.status);
    document.getElementById('detailJoined').textContent = new Date(user.joinedAt).toLocaleString();

    viewDetailsModal.classList.add('active');
  };

  // Delete User
  window.deleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`${API_BASE}/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) { fetchStudents(); fetchMetrics(); }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Submit Form (Add Student / Edit Student)
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = formUserId.value;
    const isEdit = !!id;

    const payload = {
      name: formName.value,
      email: formEmail.value,
      // Always Student / Parent from this form; edit preserves existing role
      role: isEdit ? formRole.value : 'Student / Parent',
      phone: formPhone.value,
      subjects: formSubjects.value,
      address: formAddress.value
    };

    if (isEdit) {
      payload.status = formStatus.value;
    }

    try {
      const url = isEdit ? `${API_BASE}/users/${id}` : `${API_BASE}/users`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        userFormModal.classList.remove('active');
        fetchStudents(); // Refresh students/parents list only
        fetchMetrics();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Server error.');
    }
  });

  // Init
  checkAuth();

  // ==========================================
  
setTimeout(() => {
  const el = document.getElementById('searchInput');
  if (el) {
    let debounceTimer;
    // Overwrite oninput to prevent duplicate listeners if script runs multiple times
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.studentsSearch = e.target.value;
          window.fetchStudents(1);
        }
      }, 400);
    };
  }
}, 200);
