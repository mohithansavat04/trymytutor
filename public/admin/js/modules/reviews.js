// --- Ratings & Reviews ---
window.appState = window.appState || {};
window.appState.reviewsPage = 1;
window.appState.reviewsSearch = '';

window.fetchReviews = async (page = 1) => {
  window.appState.reviewsPage = page;
  try {
    const res = await fetch(`${window.API_BASE}/reviews?page=${page}&limit=10&search=${window.appState.reviewsSearch || ''}`, {
      headers: { 'Authorization': `Bearer ${window.getToken()}` }
    });
    if (res.status === 401) {
      if (typeof window.checkAuth === 'function') return window.checkAuth();
    }
    
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }
    
    const _resJson = await res.json();
    const items = _resJson.data || _resJson;
    
    if (!Array.isArray(items)) {
      throw new Error('Invalid data format received from API');
    }
    
    renderReviews(items);
  } catch (err) {
    console.error('Failed to fetch reviews', err);
    // Explicit exception handling fallback
    renderReviews([]);
    const tbody = document.getElementById('reviewsTableBody');
    if (tbody) {
       tbody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-red-400 font-medium bg-red-900/10">Error loading reviews: ${err.message}. Please try again later.</td></tr>`;
    }
  }
};

const renderReviews = (items) => {
  const tbody = document.getElementById('reviewsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="py-16 text-center"><div class="flex flex-col items-center justify-center space-y-3"><svg class="w-12 h-12 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg><span class="text-slate-400 font-medium tracking-wide">No Active Reviews Found</span><p class="text-xs text-slate-500 mt-1">There are currently no reviews matching your criteria.</p></div></td></tr>';
    return;
  }
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-brand-border/50 hover:bg-slate-800/30 transition-colors';
    tr.innerHTML = `<td class="py-4 px-6 text-slate-300 font-medium">${item.reviewerId || 'Unknown'}</td>
                    <td class="py-4 px-6 text-slate-300">${item.tutorId || 'Unknown'}</td>
                    <td class="py-4 px-6 text-slate-300 text-yellow-400 font-bold">${item.rating || 0} ★</td>
                    <td class="py-4 px-6 text-slate-300 text-sm max-w-[200px] truncate">${item.review || '-'}</td>
                    <td class="py-4 px-6 text-slate-300">${item.isHidden ? '<span class="text-red-400">Hidden</span>' : '<span class="text-green-400">Visible</span>'}</td>
                    <td class="py-4 px-6 text-right space-x-2">
                        <button onclick="toggleReviewVisibility('${item._id}', ${!item.isHidden})" class="px-3 py-1 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg text-xs font-medium transition-colors">${item.isHidden ? 'Show' : 'Hide'}</button>
                        <button onclick="deleteReview('${item._id}')" class="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });
};

setTimeout(() => {
  const el = document.getElementById('searchReviews');
  if (el) {
    let debounceTimer;
    el.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.appState) {
          window.appState.reviewsSearch = e.target.value;
          window.fetchReviews(1);
        }
      }, 400);
    };
  }

  const composeForm = document.getElementById('composeReviewForm');
  if (composeForm) {
    composeForm.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitReviewBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      
      try {
        const payload = {
          tutorId: document.getElementById('reviewTutorId').value,
          reviewerId: document.getElementById('reviewStudentId').value,
          rating: document.getElementById('reviewRating').value,
          review: document.getElementById('reviewComment').value
        };
        const res = await fetch(`${window.API_BASE}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.getToken()}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          document.getElementById('composeReviewModal').classList.add('hidden');
          composeForm.reset();
          window.fetchReviews(1);
        } else {
          alert('Failed to add review');
        }
      } catch (err) {
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Review';
      }
    };
  }
}, 500);

window.toggleReviewVisibility = async (id, isHidden) => {
    await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ isHidden })
    });
    window.fetchReviews(window.appState.reviewsPage);
};

window.deleteReview = async (id) => {
  if (confirm('Are you sure you want to delete this review?')) {
    await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    window.fetchReviews(window.appState.reviewsPage);
  }
};
