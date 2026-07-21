// ============================================
// Main Feed Page Logic (index.html)
// Handles: navbar, post creation, feed rendering,
// like/unlike, comments, edit/delete posts, search
// ============================================

// ---------- Guard: require login ----------
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

const currentUser = getStoredUser();

// ---------- Navbar setup ----------
document.addEventListener('DOMContentLoaded', () => {
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar && currentUser) navAvatar.src = profileImgUrl(currentUser.profile_picture);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await apiRequest('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
      removeToken();
      removeStoredUser();
      window.location.href = 'login.html';
    });
  }

  setupSearch();
  loadFeed();
  setupCreatePost();
});

// ---------- Search users ----------
function setupSearch() {
  const searchInput = document.getElementById('nav-search-input');
  const resultsBox = document.getElementById('search-results');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = searchInput.value.trim();
    if (q.length === 0) {
      resultsBox.classList.remove('show');
      return;
    }
    debounceTimer = setTimeout(async () => {
      try {
        const data = await apiRequest(`/users/search?q=${encodeURIComponent(q)}`);
        renderSearchResults(data.users);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-search-wrapper')) resultsBox.classList.remove('show');
  });
}

function renderSearchResults(users) {
  const resultsBox = document.getElementById('search-results');
  if (users.length === 0) {
    resultsBox.innerHTML = '<div class="search-result-item">No users found</div>';
  } else {
    resultsBox.innerHTML = users.map(u => `
      <a class="search-result-item" href="profile.html?id=${u.id}">
        <img src="${profileImgUrl(u.profile_picture)}" alt="${escapeHtml(u.name)}">
        <span>${escapeHtml(u.name)}</span>
      </a>
    `).join('');
  }
  resultsBox.classList.add('show');
}

// ---------- Create Post ----------
function setupCreatePost() {
  const form = document.getElementById('create-post-form');
  if (!form) return;

  const fileInput = document.getElementById('post-image-input');
  const previewBox = document.getElementById('post-image-preview');

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewBox.innerHTML = `<img src="${e.target.result}" alt="preview">`;
        previewBox.classList.add('show');
      };
      reader.readAsDataURL(file);
    } else {
      previewBox.classList.remove('show');
      previewBox.innerHTML = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('post-content-input').value.trim();
    if (!content) {
      showToast('Post content cannot be empty.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    if (fileInput.files[0]) formData.append('image', fileInput.files[0]);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    try {
      await apiRequest('/posts', { method: 'POST', body: formData, isFormData: true });
      form.reset();
      previewBox.classList.remove('show');
      previewBox.innerHTML = '';
      showToast('Post created successfully!', 'success');
      loadFeed();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post';
    }
  });
}

// ---------- Load & Render Feed ----------
async function loadFeed() {
  const feedEl = document.getElementById('feed');
  if (!feedEl) return;
  feedEl.innerHTML = '<div class="loading">Loading posts...</div>';

  try {
    const data = await apiRequest('/posts');
    if (data.posts.length === 0) {
      feedEl.innerHTML = '<div class="empty-state">No posts yet. Be the first to share something!</div>';
      return;
    }
    feedEl.innerHTML = data.posts.map(renderPostCard).join('');
    attachPostEventListeners();
  } catch (err) {
    feedEl.innerHTML = `<div class="empty-state">Failed to load feed: ${escapeHtml(err.message)}</div>`;
  }
}

// ---------- Render a single post card ----------
function renderPostCard(post) {
  const isOwner = currentUser && currentUser.id === post.user_id;
  const imageHtml = post.image ? `<img class="post-image" src="${postImgUrl(post.image)}" alt="post image">` : '';

  return `
    <div class="post-card" data-post-id="${post.id}">
      <div class="post-header">
        <a href="profile.html?id=${post.user_id}">
          <img class="post-avatar" src="${profileImgUrl(post.author_picture)}" alt="${escapeHtml(post.author_name)}">
        </a>
        <div>
          <a href="profile.html?id=${post.user_id}"><div class="post-author">${escapeHtml(post.author_name)}</div></a>
          <div class="post-time">${timeAgo(post.created_at)}</div>
        </div>
        ${isOwner ? `
        <div class="post-menu">
          <button class="post-menu-btn" data-action="toggle-menu">⋯</button>
          <div class="post-menu-dropdown">
            <button data-action="edit-post">Edit</button>
            <button data-action="delete-post">Delete</button>
          </div>
        </div>` : ''}
      </div>

      <div class="post-content" data-role="post-content">${escapeHtml(post.content)}</div>
      ${imageHtml}

      <div class="post-stats">
        <span data-role="like-count">${post.like_count} like${post.like_count !== 1 ? 's' : ''}</span>
        <span data-role="comment-count">${post.comment_count} comment${post.comment_count !== 1 ? 's' : ''}</span>
      </div>

      <div class="post-actions">
        <button class="action-btn ${post.liked_by_me ? 'liked' : ''}" data-action="toggle-like">
          ${post.liked_by_me ? '❤️ Liked' : '🤍 Like'}
        </button>
        <button class="action-btn" data-action="toggle-comments">💬 Comment</button>
      </div>

      <div class="comments-section" data-role="comments-section">
        <div class="comments-list" data-role="comments-list"></div>
        <form class="comment-form" data-action="comment-form">
          <input type="text" placeholder="Write a comment..." data-role="comment-input" maxlength="1000" required>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  `;
}

// ---------- Attach event listeners to feed (event delegation) ----------
function attachPostEventListeners() {
  const feedEl = document.getElementById('feed');

  feedEl.addEventListener('click', async (e) => {
    const postCard = e.target.closest('.post-card');
    if (!postCard) return;
    const postId = postCard.dataset.postId;

    // Toggle post menu dropdown
    if (e.target.dataset.action === 'toggle-menu') {
      const dropdown = postCard.querySelector('.post-menu-dropdown');
      document.querySelectorAll('.post-menu-dropdown.show').forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
      dropdown.classList.toggle('show');
      return;
    }

    // Like / Unlike toggle
    if (e.target.dataset.action === 'toggle-like') {
      await handleToggleLike(postCard, postId, e.target);
      return;
    }

    // Show/hide comments
    if (e.target.dataset.action === 'toggle-comments') {
      const section = postCard.querySelector('[data-role="comments-section"]');
      section.classList.toggle('show');
      if (section.classList.contains('show')) loadComments(postCard, postId);
      return;
    }

    // Edit post
    if (e.target.dataset.action === 'edit-post') {
      handleEditPost(postCard, postId);
      return;
    }

    // Delete post
    if (e.target.dataset.action === 'delete-post') {
      handleDeletePost(postCard, postId);
      return;
    }
  });

  // Close dropdowns when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.post-menu')) {
      document.querySelectorAll('.post-menu-dropdown.show').forEach(d => d.classList.remove('show'));
    }
  });

  // Comment form submission (event delegation for dynamically added forms)
  feedEl.addEventListener('submit', async (e) => {
    if (e.target.dataset.action === 'comment-form') {
      e.preventDefault();
      const postCard = e.target.closest('.post-card');
      const postId = postCard.dataset.postId;
      const input = e.target.querySelector('[data-role="comment-input"]');
      const content = input.value.trim();
      if (!content) return;

      try {
        await apiRequest(`/posts/${postId}/comments`, { method: 'POST', body: { content } });
        input.value = '';
        loadComments(postCard, postId);
        updateCommentCount(postCard, 1);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });
}

// ---------- Like / Unlike ----------
async function handleToggleLike(postCard, postId, btn) {
  const isLiked = btn.classList.contains('liked');
  const countEl = postCard.querySelector('[data-role="like-count"]');

  try {
    let data;
    if (isLiked) {
      data = await apiRequest(`/posts/${postId}/like`, { method: 'DELETE' });
      btn.classList.remove('liked');
      btn.innerHTML = '🤍 Like';
    } else {
      data = await apiRequest(`/posts/${postId}/like`, { method: 'POST' });
      btn.classList.add('liked');
      btn.innerHTML = '❤️ Liked';
    }
    countEl.textContent = `${data.like_count} like${data.like_count !== 1 ? 's' : ''}`;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ---------- Comments ----------
async function loadComments(postCard, postId) {
  const listEl = postCard.querySelector('[data-role="comments-list"]');
  listEl.innerHTML = '<div class="loading">Loading comments...</div>';

  try {
    const data = await apiRequest(`/posts/${postId}/comments`);
    if (data.comments.length === 0) {
      listEl.innerHTML = '<div class="empty-state" style="padding:10px;">No comments yet.</div>';
      return;
    }
    listEl.innerHTML = data.comments.map(renderComment).join('');
    attachCommentEventListeners(listEl, postCard);
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">Failed to load comments.</div>`;
  }
}

function renderComment(comment) {
  const isOwner = currentUser && currentUser.id === comment.user_id;
  return `
    <div class="comment" data-comment-id="${comment.id}">
      <img class="comment-avatar" src="${profileImgUrl(comment.author_picture)}" alt="${escapeHtml(comment.author_name)}">
      <div class="comment-bubble">
        <div class="comment-author">${escapeHtml(comment.author_name)}</div>
        <div class="comment-text" data-role="comment-text">${escapeHtml(comment.content)}</div>
        <div class="comment-meta">
          <span>${timeAgo(comment.created_at)}</span>
          ${isOwner ? `<button data-action="edit-comment">Edit</button><button data-action="delete-comment">Delete</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function attachCommentEventListeners(listEl, postCard) {
  listEl.addEventListener('click', async (e) => {
    const commentEl = e.target.closest('.comment');
    if (!commentEl) return;
    const commentId = commentEl.dataset.commentId;

    if (e.target.dataset.action === 'edit-comment') {
      const textEl = commentEl.querySelector('[data-role="comment-text"]');
      const currentText = textEl.textContent;
      const newText = prompt('Edit your comment:', currentText);
      if (newText === null || newText.trim() === '' || newText === currentText) return;

      try {
        await apiRequest(`/comments/${commentId}`, { method: 'PUT', body: { content: newText.trim() } });
        textEl.textContent = newText.trim();
        showToast('Comment updated.', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    if (e.target.dataset.action === 'delete-comment') {
      if (!confirm('Delete this comment?')) return;
      try {
        await apiRequest(`/comments/${commentId}`, { method: 'DELETE' });
        commentEl.remove();
        updateCommentCount(postCard, -1);
        showToast('Comment deleted.', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });
}

function updateCommentCount(postCard, delta) {
  const countEl = postCard.querySelector('[data-role="comment-count"]');
  const current = parseInt(countEl.textContent, 10) || 0;
  const updated = Math.max(0, current + delta);
  countEl.textContent = `${updated} comment${updated !== 1 ? 's' : ''}`;
}

// ---------- Edit / Delete Post ----------
async function handleEditPost(postCard, postId) {
  const contentEl = postCard.querySelector('[data-role="post-content"]');
  const currentContent = contentEl.textContent;
  const newContent = prompt('Edit your post:', currentContent);
  if (newContent === null || newContent.trim() === '' || newContent === currentContent) return;

  try {
    await apiRequest(`/posts/${postId}`, { method: 'PUT', body: { content: newContent.trim() } });
    contentEl.textContent = newContent.trim();
    showToast('Post updated.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleDeletePost(postCard, postId) {
  if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
  try {
    await apiRequest(`/posts/${postId}`, { method: 'DELETE' });
    postCard.remove();
    showToast('Post deleted.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
