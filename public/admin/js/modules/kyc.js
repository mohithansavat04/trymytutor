// --- KYC Verification ---
window.appState = window.appState || {};
window.appState.kycPage = 1;
window.appState.kycSearch = '';

window.fetchKyc = async (page = 1) => {
  window.appState.kycPage = page;
  try {
    const res = await fetch(`${API_BASE}/kyc?page=${page}&limit=10&search=${window.appState.kycSearch || ''}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status === 401) return checkAuth();
    const _resJson = await res.json();
    const items = _resJson.data || _resJson;
    renderKyc(items);
  } catch (err) {
    console.error('Failed to fetch kyc', err);
  }
};

const renderKyc = (items) => {
  const tbody = document.getElementById('kycTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-500">No KYC records found</td></tr>';
    return;
  }
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-brand-border/50 hover:bg-slate-800/30 transition-colors';
    tr.innerHTML = `<td class="py-4 px-6 text-slate-300 text-sm font-mono">${item.tutorId || item._id}</td>
                    <td class="py-4 px-6 text-slate-300">${item.documentType}</td>
                    <td class="py-4 px-6 text-slate-300">${item.status}</td>
                    <td class="py-4 px-6 text-right space-x-2">
                        <button onclick="updateKycStatus('${item._id}', 'Verified')" class="px-3 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-colors">Verify</button>
                        <button onclick="updateKycStatus('${item._id}', 'Rejected')" class="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">Reject</button>
                        <button onclick="deleteKyc('${item._id}')" class="px-3 py-1 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 rounded-lg text-xs font-medium transition-colors">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });
};

setTimeout(() => {
  const el = document.getElementById('searchKyc');
  if (el) {
    let debounceTimer;
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.kycSearch = e.target.value;
          window.fetchKyc(1);
        }
      }, 400);
    };
  }

  // File Upload Dropzone Logic
  const dropzone = document.getElementById('kycFileDropzone');
  const fileInput = document.getElementById('kycFile');
  const fileNameDisplay = document.getElementById('kycFileName');
  let selectedFile = null;

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-brand-primary', 'bg-slate-800');
    });
    
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-brand-primary', 'bg-slate-800');
    });
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-brand-primary', 'bg-slate-800');
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect();
      }
    });

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect() {
      if (fileInput.files.length > 0) {
        selectedFile = fileInput.files[0];
        fileNameDisplay.textContent = `Selected: ${selectedFile.name}`;
        fileNameDisplay.classList.remove('hidden');
      }
    }
  }

  const form = document.getElementById('uploadKycForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      
      if (!selectedFile) {
        alert('Please attach a document file.');
        return;
      }

      const submitBtn = document.getElementById('submitKycBtn');
      const submitText = document.getElementById('submitKycText');
      const submitLoader = document.getElementById('submitKycLoader');
      
      submitBtn.disabled = true;
      submitText.textContent = 'Uploading...';
      submitLoader.classList.remove('hidden');

      try {
        // Mock file upload processing since we assume no multer endpoint right now.
        // We simulate sending a payload with a generated document URL
        const simulatedFileUrl = `/storage/kyc/\${Date.now()}_\${selectedFile.name.replace(/\\s+/g, '_')}`;

        const payload = {
          tutor: document.getElementById('kycTutor').value,
          documentType: document.getElementById('kycDocType').value,
          documentNumber: 'DOC-' + Math.floor(Math.random() * 1000000),
          documentUrl: simulatedFileUrl,
          status: 'Pending'
        };
        const res = await fetch(`${window.API_BASE}/kyc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.getToken()}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          document.getElementById('uploadKycModal').classList.add('hidden');
          form.reset();
          selectedFile = null;
          fileNameDisplay.textContent = '';
          fileNameDisplay.classList.add('hidden');
          window.fetchKyc(1);
        } else {
          alert('Failed to submit KYC document.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred during submission.');
      } finally {
        submitBtn.disabled = false;
        submitText.textContent = 'Submit KYC';
        submitLoader.classList.add('hidden');
      }
    };
  }
}, 500);

window.updateKycStatus = async (id, status) => {
    let notes = prompt('Please enter any reviewer notes for this KYC (Optional):');
    let bodyData = { status };
    if (notes !== null) bodyData.reviewerNotes = notes;

    await fetch(`${API_BASE}/kyc/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(bodyData)
    });
    window.fetchKyc(window.appState.kycPage);
};

window.deleteKyc = async (id) => {
  if (confirm('Are you sure you want to delete this KYC document?')) {
    await fetch(`${API_BASE}/kyc/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    window.fetchKyc(window.appState.kycPage);
  }
};
