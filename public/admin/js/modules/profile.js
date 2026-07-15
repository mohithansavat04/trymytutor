// --- Profile Management ---
const profileForm = document.getElementById('profileForm');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePassword = document.getElementById('profilePassword');
const saveProfileBtn = document.getElementById('saveProfileBtn');

window.fetchProfileData = async () => {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.ok) {
      const adminData = await res.json();
      if (profileName) profileName.value = adminData.name || '';
      if (profileEmail) profileEmail.value = adminData.email || '';
    }
  } catch (err) {
    console.error('Failed to fetch profile', err);
  }
};

if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const originalBtnText = saveProfileBtn.textContent;
    saveProfileBtn.textContent = 'Saving...';
    saveProfileBtn.disabled = true;

    const body = {
      name: profileName.value,
      email: profileEmail.value
    };
    if (profilePassword.value) {
      body.password = profilePassword.value;
    }

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Profile updated successfully!');
        if (data.admin && data.admin.name) {
          localStorage.setItem('adminName', data.admin.name);
          if (typeof checkAuth === 'function') checkAuth(); // refresh sidebar
        }
        if (profilePassword) profilePassword.value = '';
      } else {
        alert(data.message || 'Error updating profile');
      }
    } catch (err) {
      alert('Server error while updating profile');
    } finally {
      saveProfileBtn.textContent = originalBtnText;
      saveProfileBtn.disabled = false;
    }
  });
}
