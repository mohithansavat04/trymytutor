document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = '/api/admin';
  let allUsers = [];

  // --- Views ---
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');

  // --- Elements ---
  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');
  const logoutBtn = document.getElementById('logoutBtn');
  const userTableBody = document.getElementById('userTableBody');
  
  const searchInput = document.getElementById('searchInput');
  const roleFilter = document.getElementById('roleFilter');
  
  // Modals
  const userFormModal = document.getElementById('userFormModal');
  const openAddUserModal = document.getElementById('openAddUserModal');
  const openAddTutorModalBtn = document.getElementById('openAddTutorModalBtn');
  const closeUserFormModal = document.getElementById('closeUserFormModal');
  const cancelFormBtn = document.getElementById('cancelFormBtn');
  const userForm = document.getElementById('userForm');
  const modalTitle = document.getElementById('modalTitle');
  const statusGroup = document.getElementById('statusGroup');
  
  const viewDetailsModal = document.getElementById('viewDetailsModal');
  const closeViewDetailsModal = document.getElementById('closeViewDetailsModal');

  // Form Fields
  const formUserId = document.getElementById('formUserId');
  const formName = document.getElementById('formName');
  const formEmail = document.getElementById('formEmail');
  const formRole = document.getElementById('formRole');
  const formStatus = document.getElementById('formStatus');
  const formPhone = document.getElementById('formPhone');
  const formSubjects = document.getElementById('formSubjects');
  const formAddress = document.getElementById('formAddress');

  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      if (type === 'text') {
        togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
      } else {
        togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      }
    });
  }

  // --- Menu Switching ---
  const menuUsers = document.getElementById('menuUsers');
  const menuDashboard = document.getElementById('menuDashboard');
  const menuTutorApprovals = document.getElementById('menuTutorApprovals');
  const menuMcqs = document.getElementById('menuMcqs');
  const menuRequirements = document.getElementById('menuRequirements');
  const menuBids = document.getElementById('menuBids');
  const menuDemos = document.getElementById('menuDemos');
  const menuSettings = document.getElementById('menuSettings');
  
  const dashboardContent = document.getElementById('dashboardContent');
  const tutorApprovalsContent = document.getElementById('tutorApprovalsContent');
  const usersContent = document.getElementById('usersContent');
  const mcqsContent = document.getElementById('mcqsContent');
  const requirementsContent = document.getElementById('requirementsContent');
  const bidsContent = document.getElementById('bidsContent');
  const demosContent = document.getElementById('demosContent');
  const settingsContent = document.getElementById('settingsContent');
  const mainHeaderTitle = document.getElementById('mainHeaderTitle');

  const activeMenuClass = ['bg-brand/10', 'text-brand'];
  const inactiveMenuClass = ['text-slate-400', 'hover:bg-slate-800', 'hover:text-white'];

  const menus = [
    { el: menuDashboard, content: dashboardContent, title: 'Dashboard Overview', name: 'dashboard' },
    { el: menuTutorApprovals, content: tutorApprovalsContent, title: 'Tutor Approval Pipeline', name: 'tutor-approvals' },
    { el: menuUsers, content: usersContent, title: 'Students / Parents', name: 'users' },
    { el: menuMcqs, content: mcqsContent, title: 'Agreement MCQs', name: 'mcqs' },
    { el: menuRequirements, content: requirementsContent, title: 'Requirements', name: 'requirements' },
    { el: menuBids, content: bidsContent, title: 'Tutor Bids', name: 'bids' },
    { el: menuDemos, content: demosContent, title: 'Scheduled Demos', name: 'demos' },
    { el: menuSettings, content: settingsContent, title: 'Settings & Roles', name: 'settings' },
  ];

  const switchMenu = (menuName, pushState = true) => {
    menus.forEach(m => {
      if (m.name === menuName) {
        m.el.classList.add(...activeMenuClass);
        m.el.classList.remove(...inactiveMenuClass);
        m.content.classList.remove('hidden');
        mainHeaderTitle.textContent = m.title;
      } else {
        m.el.classList.remove(...activeMenuClass);
        m.el.classList.add(...inactiveMenuClass);
        m.content.classList.add('hidden');
      }
    });

    if (menuName === 'users') {
      openAddUserModal.classList.remove('hidden');
      openAddUserModal.classList.add('flex');
      openAddTutorModalBtn.classList.add('hidden');
      openAddTutorModalBtn.classList.remove('flex');
    } else if (menuName === 'tutor-approvals') {
      openAddTutorModalBtn.classList.remove('hidden');
      openAddTutorModalBtn.classList.add('flex');
      openAddUserModal.classList.add('hidden');
      openAddUserModal.classList.remove('flex');
    } else {
      openAddUserModal.classList.add('hidden');
      openAddUserModal.classList.remove('flex');
      openAddTutorModalBtn.classList.add('hidden');
      openAddTutorModalBtn.classList.remove('flex');
    }

    if (pushState) {
      window.history.pushState({ menu: menuName }, '', `/admin/${menuName}`);
    }
  };

  menuUsers.addEventListener('click', (e) => { e.preventDefault(); switchMenu('users'); fetchStudents(); });
  menuDashboard.addEventListener('click', (e) => { e.preventDefault(); switchMenu('dashboard'); });
  menuTutorApprovals.addEventListener('click', (e) => { e.preventDefault(); switchMenu('tutor-approvals'); fetchTutorApprovals(); });
  menuMcqs.addEventListener('click', (e) => { e.preventDefault(); switchMenu('mcqs'); fetchMcqs(); });
  menuRequirements.addEventListener('click', (e) => { e.preventDefault(); switchMenu('requirements'); fetchRequirements(); });
  menuBids.addEventListener('click', (e) => { e.preventDefault(); switchMenu('bids'); fetchBids(); });
  menuDemos.addEventListener('click', (e) => { e.preventDefault(); switchMenu('demos'); fetchDemos(); });
  menuSettings.addEventListener('click', (e) => { e.preventDefault(); switchMenu('settings'); fetchSettings(); fetchTeamMembers(); });

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.menu) {
      switchMenu(e.state.menu, false);
    } else {
      initRoute();
    }
  });

  const initRoute = () => {
    const path = window.location.pathname;
    // Use setTimeout so all const declarations (fetchTutorApprovals, fetchMcqs, etc.)
    // are fully initialized before being called
    setTimeout(() => {
      if (path.includes('/tutor-approvals')) { switchMenu('tutor-approvals', false); fetchTutorApprovals(); }
      else if (path.includes('/mcqs'))        { switchMenu('mcqs', false);        fetchMcqs(); }
      else if (path.includes('/requirements')){ switchMenu('requirements', false); fetchRequirements(); }
      else if (path.includes('/bids'))        { switchMenu('bids', false);        fetchBids(); }
      else if (path.includes('/demos'))       { switchMenu('demos', false);       fetchDemos(); }
      else if (path.includes('/settings'))    { switchMenu('settings', false);    fetchSettings(); fetchTeamMembers(); }
      else if (path.includes('/dashboard'))   { switchMenu('dashboard', false); }
      else                                    { switchMenu('users', false);       fetchStudents(); }
    }, 0);
  };


  // --- State Management ---
  const getToken = () => localStorage.getItem('adminToken');
  const getRole = () => localStorage.getItem('adminRole');
  const getPermissions = () => {
    try { return JSON.parse(localStorage.getItem('adminPermissions') || '[]'); } 
    catch(e) { return []; }
  };
  
  const applyAccessControl = () => {
    const role = getRole();
    const permissions = getPermissions();
    if (!role) return;

    // By default show all
    [menuTutorApprovals, menuMcqs, menuRequirements, menuBids, menuDemos, menuSettings].forEach(m => {
      if (m && m.parentElement) m.parentElement.style.display = 'block';
    });

    const superAdminSectionEls = document.querySelectorAll('.mt-8.mb-4.px-4');
    const superAdminLabel = Array.from(superAdminSectionEls).find(el => el.textContent.includes('Super Admin'));

    if (role === 'Super Admin') {
      if (superAdminLabel) superAdminLabel.style.display = 'block';
      return; // Super Admin sees everything
    }

    if (superAdminLabel) superAdminLabel.style.display = 'none';

    // Apply granular permissions
    if (!permissions.includes('view_users')) {
      // the students menu doesn't have a distinct ID in JS for the sidebar, but we can hide the first menu item
      // Actually we didn't add an ID for Students menu. Wait, let's just let it fall back.
    }
    if (!permissions.includes('view_tutors') && menuTutorApprovals) menuTutorApprovals.parentElement.style.display = 'none';
    if (!permissions.includes('view_mcqs') && menuMcqs) menuMcqs.parentElement.style.display = 'none';
    if (!permissions.includes('view_requirements') && menuRequirements) menuRequirements.parentElement.style.display = 'none';
    if (!permissions.includes('view_bids') && menuBids) menuBids.parentElement.style.display = 'none';
    if (!permissions.includes('view_demos') && menuDemos) menuDemos.parentElement.style.display = 'none';
    if (!permissions.includes('manage_settings') && menuSettings) menuSettings.parentElement.style.display = 'none';
  };

  const checkAuth = () => {
    if (getToken()) {
      loginView.classList.remove('flex');
      loginView.classList.add('hidden');
      dashboardView.classList.remove('hidden');
      applyAccessControl();
      fetchDashboardData();
      initRoute();
    } else {
      loginView.classList.remove('hidden');
      loginView.classList.add('flex');
      dashboardView.classList.add('hidden');
    }
  };

  const fetchDashboardData = () => {
    fetchMetrics();
    fetchStudents();
  };

  // --- Auth Logic ---
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        if (data.admin && data.admin.role) localStorage.setItem('adminRole', data.admin.role);
        if (data.admin && data.admin.permissions) localStorage.setItem('adminPermissions', JSON.stringify(data.admin.permissions));
        errorMsg.classList.add('hidden');
        checkAuth();
      } else {
        errorMsg.textContent = data.message || 'Invalid credentials';
        errorMsg.classList.remove('hidden');
      }
    } catch (err) {
      errorMsg.textContent = 'Server error. Try again.';
      errorMsg.classList.remove('hidden');
    }
  });

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminPermissions');
    checkAuth();
  });

  // --- Metrics Management ---
  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/metrics`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const metrics = await res.json();
        document.getElementById('metricTotal').textContent = metrics.totalUsers;
        document.getElementById('metricTutors').textContent = metrics.tutorsCount;
        document.getElementById('metricStudents').textContent = metrics.studentsCount;
        if(document.getElementById('metricRequirements')) document.getElementById('metricRequirements').textContent = metrics.requirementsCount || 0;
        if(document.getElementById('metricBids')) document.getElementById('metricBids').textContent = metrics.activeBidsCount || 0;
        if(document.getElementById('metricDemos')) document.getElementById('metricDemos').textContent = metrics.demosCount || 0;
      }
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    }
  };


  // --- Students / Parents Management (role = 'Student / Parent' only) ---
  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        checkAuth();
        return;
      }
      const all = await res.json();
      // Filter to students/parents only — tutors go to Tutor Approvals
      allUsers = all.filter(u => u.role === 'Student / Parent');
      renderUsers(allUsers);
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
  const filterUsers = () => {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = allUsers.filter(user => {
      return user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
    });
    renderUsers(filtered);
  };

  if (searchInput) searchInput.addEventListener('input', filterUsers);

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
  // --- Agreement MCQs Management ---
  // ==========================================

  let allMcqs = [];
  const mcqsGrid = document.getElementById('mcqsGrid');
  const mcqFormModal = document.getElementById('mcqFormModal');
  const openAddMcqModal = document.getElementById('openAddMcqModal');
  const closeMcqFormModal = document.getElementById('closeMcqFormModal');
  const cancelMcqFormBtn = document.getElementById('cancelMcqFormBtn');
  const mcqForm = document.getElementById('mcqForm');
  const mcqModalTitle = document.getElementById('mcqModalTitle');
  const formMcqId = document.getElementById('formMcqId');
  const formMcqQuestion = document.getElementById('formMcqQuestion');
  const optionsContainer = document.getElementById('optionsContainer');
  const addOptionBtn = document.getElementById('addOptionBtn');

  const fetchMcqs = async () => {
    try {
      const res = await fetch(`${API_BASE}/mcqs`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        allMcqs = await res.json();
        renderMcqs();
      }
    } catch (err) {
      console.error('Failed to fetch MCQs', err);
    }
  };

  const renderMcqs = () => {
    mcqsGrid.innerHTML = '';
    
    if (!allMcqs || allMcqs.length === 0) {
      mcqsGrid.innerHTML = `
        <div class="col-span-full py-10 text-center text-slate-500">
          <p>No MCQs created yet. Click "Add New MCQ" to get started.</p>
        </div>
      `;
      return;
    }

    allMcqs.forEach((mcq, idx) => {
      const card = document.createElement('div');
      card.className = "bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-brand/50 transition-all flex flex-col h-full";
      
      let optionsHtml = '';
      mcq.options.forEach((opt, oIdx) => {
        const isCorrect = oIdx === mcq.correctOptionIndex;
        optionsHtml += `
          <div class="flex items-start mb-2 px-3 py-2 rounded-lg text-sm border ${isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-100' : 'bg-slate-800/50 border-slate-700 text-slate-300'}">
            <div class="mr-2 mt-0.5">
              ${isCorrect 
                ? '<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                : '<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"></circle></svg>'
              }
            </div>
            <div class="flex-1">${opt}</div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
          <div class="px-2 py-1 bg-brand/10 text-brand text-xs font-bold rounded">Q${idx + 1}</div>
          <div class="flex gap-2">
            <button class="text-slate-400 hover:text-brand transition-colors" onclick="openEditMcqModal('${mcq._id}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button class="text-slate-400 hover:text-red-400 transition-colors" onclick="deleteMcq('${mcq._id}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
        <h4 class="font-medium text-white mb-4 line-clamp-3">${mcq.question}</h4>
        <div class="mt-auto space-y-1">
          ${optionsHtml}
        </div>
      `;
      mcqsGrid.appendChild(card);
    });
  };

  const createOptionRow = (value = '', isCorrect = false) => {
    const row = document.createElement('div');
    row.className = "flex items-center gap-3 option-row animate-slide-up";
    row.innerHTML = `
      <label class="flex items-center justify-center w-8 h-8 rounded-full border border-slate-600 bg-slate-800 cursor-pointer hover:border-brand transition-all relative">
        <input type="radio" name="correctOption" class="peer sr-only" ${isCorrect ? 'checked' : ''} required>
        <div class="w-4 h-4 rounded-full peer-checked:bg-brand transition-all scale-0 peer-checked:scale-100"></div>
      </label>
      <input type="text" class="option-input flex-1 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg focus:outline-none focus:border-brand text-sm text-white transition-all shadow-inner" placeholder="Option text..." value="${value}" required>
      <button type="button" class="remove-option-btn text-slate-500 hover:text-red-400 p-2 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;

    row.querySelector('.remove-option-btn').addEventListener('click', () => {
      if (optionsContainer.children.length > 1) {
        row.remove();
      } else {
        alert('You must have at least one option.');
      }
    });

    optionsContainer.appendChild(row);
  };

  openAddMcqModal.addEventListener('click', () => {
    formMcqId.value = '';
    formMcqQuestion.value = '';
    mcqModalTitle.textContent = 'Add New MCQ';
    optionsContainer.innerHTML = '';
    
    // Add two default blank options
    createOptionRow('', true);
    createOptionRow('', false);
    
    mcqFormModal.classList.add('active');
  });

  const closeMcqModal = () => {
    mcqFormModal.classList.remove('active');
  };

  closeMcqFormModal.addEventListener('click', closeMcqModal);
  cancelMcqFormBtn.addEventListener('click', closeMcqModal);

  addOptionBtn.addEventListener('click', () => {
    createOptionRow('', false);
  });

  window.openEditMcqModal = (id) => {
    const mcq = allMcqs.find(m => m._id === id);
    if (!mcq) return;

    formMcqId.value = mcq._id;
    formMcqQuestion.value = mcq.question;
    mcqModalTitle.textContent = 'Edit MCQ';
    
    optionsContainer.innerHTML = '';
    mcq.options.forEach((opt, idx) => {
      createOptionRow(opt, idx === mcq.correctOptionIndex);
    });

    mcqFormModal.classList.add('active');
  };

  mcqForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = formMcqId.value;
    const question = formMcqQuestion.value;
    
    const optionRows = Array.from(optionsContainer.querySelectorAll('.option-row'));
    const options = [];
    let correctOptionIndex = -1;

    optionRows.forEach((row, idx) => {
      const input = row.querySelector('.option-input');
      const radio = row.querySelector('input[type="radio"]');
      options.push(input.value);
      if (radio.checked) {
        correctOptionIndex = idx;
      }
    });

    if (correctOptionIndex === -1) {
      alert('Please select one correct option.');
      return;
    }

    const payload = { question, options, correctOptionIndex };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/mcqs/${id}` : `${API_BASE}/mcqs`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        closeMcqModal();
        fetchMcqs();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error saving MCQ');
      }
    } catch (err) {
      alert('Network error');
    }
  });

  window.deleteMcq = async (id) => {
    if (confirm('Are you sure you want to delete this MCQ?')) {
      try {
        const res = await fetch(`${API_BASE}/mcqs/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
          fetchMcqs();
        }
      } catch (err) {
        alert('Failed to delete MCQ');
      }
    }
  };

  // ==========================================
  // --- Requirements Management ---
  // ==========================================
  const requirementsTableBody = document.getElementById('requirementsTableBody');
  
  const fetchRequirements = async () => {
    try {
      const res = await fetch(`${API_BASE}/requirements`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const requirements = await res.json();
        renderRequirements(requirements);
      }
    } catch (err) {
      console.error('Failed to fetch Requirements', err);
    }
  };

  const renderRequirements = (reqs) => {
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
          <button class="px-3 py-1 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors" onclick="deleteRequirement('${req._id}')">Delete</button>
        </td>
      `;
      requirementsTableBody.appendChild(tr);
    });
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
          fetchDashboardData();
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
  
  const fetchBids = async () => {
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
                          '<span class="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md text-xs">Pending</span>';
      
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-800/50 transition-colors";
      tr.innerHTML = `
        <td class="py-4 px-4 border-b border-brand-border text-sm font-medium text-white">${tutorName}</td>
        <td class="py-4 px-4 border-b border-brand-border text-sm text-slate-300">${reqInfo}</td>
        <td class="py-4 px-4 border-b border-brand-border text-sm text-brand font-medium">${bid.amount}</td>
        <td class="py-4 px-4 border-b border-brand-border">${statusBadge}</td>
        <td class="py-4 px-4 border-b border-brand-border text-right">
          <button class="px-3 py-1 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors" onclick="deleteBid('${bid._id}')">Delete</button>
        </td>
      `;
      bidsTableBody.appendChild(tr);
    });
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
          fetchDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ==========================================
  // --- Demos Management ---
  // ==========================================
  const demosTableBody = document.getElementById('demosTableBody');
  
  const fetchDemos = async () => {
    try {
      const res = await fetch(`${API_BASE}/demos`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const demos = await res.json();
        renderDemos(demos);
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
          <button class="px-3 py-1 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors" onclick="deleteDemo('${demo._id}')">Delete</button>
        </td>
      `;
      demosTableBody.appendChild(tr);
    });
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
          fetchDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ==========================================
  // --- Tutor Approvals Management ---
  // ==========================================
  const tutorApprovalsTableBody = document.getElementById('tutorApprovalsTableBody');
  let currentTutors = [];

  const fetchTutorApprovals = async () => {
    try {
      const res = await fetch(`${API_BASE}/tutor-approvals`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        document.getElementById('metricAwaitingInterview').textContent = data.metrics.awaitingInterview;
        document.getElementById('metricLiveTutors').textContent = data.metrics.liveTutors;
        document.getElementById('metricMcqFailed').textContent = data.metrics.mcqFailedToday;
        document.getElementById('metricSuspended').textContent = data.metrics.suspendedThisWeek;
        
        currentTutors = data.tutors;
        renderTutorApprovals(data.tutors);
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
        stateBadge = `<span class="px-2 py-1 bg-slate-500/10 text-slate-400 rounded-md text-xs font-semibold">${tutor.tutorState || 'Pending'}</span>`;
      }

      let actionsHtml = '';
      if (tutor.tutorState === 'Interview pending') {
        actionsHtml += `
          <button class="px-2 py-1 text-xs font-semibold bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors mr-1 shadow-md shadow-orange-500/20" onclick="updateTutorState('${tutor._id}', 'Pass')">Pass</button>
          <button class="px-2 py-1 text-xs font-semibold bg-transparent text-red-400 border border-red-400/50 rounded hover:bg-red-400/10 transition-colors mr-1" onclick="updateTutorState('${tutor._id}', 'Fail')">Fail</button>
        `;
      } else if (tutor.tutorState === 'Live') {
        actionsHtml += `
          <button class="px-2 py-1 text-xs font-semibold bg-transparent text-slate-300 border border-slate-600 rounded-full hover:bg-slate-800 transition-colors mr-1" onclick="updateTutorState('${tutor._id}', 'Make in-house')">In-house</button>
        `;
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

  const fetchRoles = async () => {
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

  const fetchSettings = async () => {
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

  const fetchTeamMembers = async () => {
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

});
