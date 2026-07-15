// --- Notifications Manager ---
window.appState = window.appState || {};
window.appState.notificationsPage = 1;
window.appState.notificationsSearch = '';

window.fetchNotifications = async (page = 1) => {
  window.appState.notificationsPage = page;
  try {
    const res = await fetch(`${API_BASE}/notifications?page=${page}&limit=10&search=${window.appState.notificationsSearch || ''}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status === 401) return checkAuth();
    const _resJson = await res.json();
    const items = _resJson.data || _resJson;
    renderNotifications(items);
  } catch (err) {
    console.error('Failed to fetch notifications', err);
  }
};

const renderNotifications = (items) => {
  const tbody = document.getElementById('notificationsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-500">No Notifications found</td></tr>';
    return;
  }
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-brand-border/50 hover:bg-slate-800/30 transition-colors';
    tr.innerHTML = `<td class="py-4 px-6 text-slate-300 font-medium">${item.title}</td>
                    <td class="py-4 px-6 text-slate-300 text-sm truncate max-w-[200px]">${item.body || '-'}</td>
                    <td class="py-4 px-6 text-slate-300">${item.channel || 'In-App'}</td>
                    <td class="py-4 px-6 text-slate-300">${item.status || 'Sent'}</td>
                    <td class="py-4 px-6 text-right space-x-2">
                        <button onclick="deleteNotification('${item._id}')" class="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });
};

setTimeout(() => {
  const el = document.getElementById('searchNotifications');
  if (el) {
    let debounceTimer;
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.notificationsSearch = e.target.value;
          window.fetchNotifications(1);
        }
      }, 400);
    };
  }

  const form = document.getElementById('composeNotificationForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitNotifBtn');
      const submitText = document.getElementById('submitNotifText');
      const submitLoader = document.getElementById('submitNotifLoader');
      
      submitBtn.disabled = true;
      submitText.textContent = 'Sending...';
      submitLoader.classList.remove('hidden');

      try {
        const channels = Array.from(document.querySelectorAll('input[name="notifChannel"]:checked')).map(cb => cb.value);
        if (channels.length === 0) {
            alert('Please select at least one channel route.');
            submitBtn.disabled = false;
            submitText.textContent = 'Send Notification';
            submitLoader.classList.add('hidden');
            return;
        }

        const payload = {
          title: document.getElementById('notifTitle').value,
          body: document.getElementById('notifBody').value,
          targetAudience: document.getElementById('notifAudience').value,
          channels: channels,
          status: 'Sent'
        };
        const res = await fetch(`${window.API_BASE}/notifications/blast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.getToken()}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          document.getElementById('composeNotificationModal').classList.add('hidden');
          form.reset();
          window.fetchNotifications(1);
        } else {
          alert('Failed to send blast notification.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred during submission.');
      } finally {
        submitBtn.disabled = false;
        submitText.textContent = 'Send Notification';
        submitLoader.classList.add('hidden');
      }
    };
  }
}, 500);

window.deleteNotification = async (id) => {
  if (confirm('Are you sure you want to delete this notification?')) {
    await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    window.fetchNotifications(window.appState.notificationsPage);
  }
};
