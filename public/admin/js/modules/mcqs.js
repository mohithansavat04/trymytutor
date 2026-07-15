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

  window.fetchMcqs = async (page = 1) => {
    appState.mcqsPage = page;
    const search = appState.mcqsSearch;
    try {
      const res = await fetch(`${API_BASE}/mcqs?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        allMcqs = json.data || [];
        renderMcqs(allMcqs);
        if (window.renderPagination) window.renderPagination('paginationMcqs', json, 'fetchMcqs');
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
  

  

setTimeout(() => {
  const el = document.getElementById('searchMcqs');
  if (el) {
    let debounceTimer;
    // Overwrite oninput to prevent duplicate listeners if script runs multiple times
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.mcqsSearch = e.target.value;
          window.fetchMcqs(1);
        }
      }, 400);
    };
  }
}, 200);
