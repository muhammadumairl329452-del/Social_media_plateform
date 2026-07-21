// ============================================
// Profile Page Logic (profile.html)
// Handles: viewing profiles, editing own profile,
// follow/unfollow, and listing a user's posts
// ============================================

if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

const loggedInUser = getStoredUser();

// Determine which profile to show: ?id=X in URL, or logged-in user's own profile
const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get('id') || loggedInUser.id;
const isOwnProfile = parseInt(profileId, 10) === loggedInUser.id;

document.addEventListener('DOMContentLoaded', () => {
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) navAvatar.src = profileImgUrl(loggedInUser.profile_picture);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeToken();
      removeStoredUser();
      window.location.href = 'login.html';
    });
  }

  loadProfile();
  loadUserPosts();
  setupEditModal();
});

// ---------- Load Profile Header ----------
async function loadProfile() {
  const headerEl = document.getElementById('profile-header');
  try {
    const endpoint = isOwnProfile ? '/users/me' : `/users/${profileId}`;
    const data = await apiRequest(endpoint);
    renderProfileHeader(data.user);
  } catch (err) {
    headerEl.innerHTML = `<div class="empty-state">Failed to load profile: ${escapeHtml(err.message)}</div>`;
  }
}

function renderProfileHeader(user) {
  const headerEl = document.getElementById('profile-header');

  const actionButtons = isOwnProfile
    ? `<button class="btn btn-secondary btn-sm" id="edit-profile-btn">Edit Profile</button>`
    : `<button class="btn ${user.is_following ? 'btn-secondary' : 'btn-primary'} btn-sm" id="follow-btn" data-following="${user.is_following}">
         ${user.is_following ? 'Unfollow' : 'Follow'}
       </button>`;

  headerEl.innerHTML = `
    <img class="profile-avatar-lg" src="${profileImgUrl(user.profile_picture)}" alt="${escapeHtml(user.name)}">
    <div class="profile-name">${escapeHtml(user.name)}</div>
    <div class="profile-email">${escapeHtml(user.email)}</div>
    <div class="profile-bio">${user.bio ? escapeHtml(user.bio) : '<em>No bio yet.</em>'}</div>
    <div class="profile-stats">
      <div class="profile-stat"><strong>${user.posts_count}</strong><span>Posts</span></div>
      <div class="profile-stat"><strong>${user.followers_count}</strong><span>Followers</span></div>
      <div class="profile-stat"><strong>${user.following_count}</strong><span>Following</span></div>
    </div>
    <div class="profile-actions">${actionButtons}</div>
  `;

  if (isOwnProfile) {
    document.getElementById('edit-profile-btn').addEventListener('click', () => openEditModal(user));
  } else {
    document.getElementById('follow-btn').addEventListener('click', (e) => handleFollowToggle(e.target));
  }
}

// ---------- Follow / Unfollow ----------
async function handleFollowToggle(btn) {
  const isFollowing = btn.dataset.following === 'true';
  btn.disabled = true;

  try {
    let data;
    if (isFollowing) {
      data = await apiRequest(`/users/${profileId}/follow`, { method: 'DELETE' });
      btn.textContent = 'Follow';
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
      btn.dataset.following = 'false';
    } else {
      data = await apiRequest(`/users/${profileId}/follow`, { method: 'POST' });
      btn.textContent = 'Unfollow';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
      btn.dataset.following = 'true';
    }
    // Update the followers count shown on the page
    const followersStatEl = document.querySelectorAll('.profile-stat strong')[1];
    if (followersStatEl) followersStatEl.textContent = data.followers_count;
    showToast(data.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

// ---------- Load User's Posts ----------
async function loadUserPosts() {
  const feedEl = document.getElementById('profile-posts');
  feedEl.innerHTML = '<div class="loading">Loading posts...</div>';

  try {
    const data = await apiRequest(`/posts/user/${profileId}`);
    if (data.posts.length === 0) {
      feedEl.innerHTML = '<div class="empty-state">No posts yet.</div>';
      return;
    }
    // renderPostCard and attachPostEventListeners are defined in main.js and reused here
    feedEl.innerHTML = data.posts.map(renderPostCard).join('');
    attachPostEventListenersForProfile();
  } catch (err) {
    feedEl.innerHTML = `<div class="empty-state">Failed to load posts.</div>`;
  }
}

// Re-uses the same rendering/event logic as the feed, scoped to #profile-posts.
// We temporarily point the shared event-delegation logic at this container by
// giving it the id "feed" behavior via a small wrapper.
function attachPostEventListenersForProfile() {
  const feedEl = document.getElementById('profile-posts');
  feedEl.id = 'feed'; // main.js's attachPostEventListeners looks up #feed
  attachPostEventListeners();
  feedEl.id = 'profile-posts';
}

// ---------- Edit Profile Modal ----------
function setupEditModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('close-edit-modal');
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  const fileInput = document.getElementById('edit-profile-picture');
  const previewImg = document.getElementById('edit-avatar-preview');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { previewImg.src = e.target.result; };
      reader.readAsDataURL(file);
    }
  });

  const form = document.getElementById('edit-profile-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-name').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (fileInput.files[0]) formData.append('profile_picture', fileInput.files[0]);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      const data = await apiRequest('/users/me', { method: 'PUT', body: formData, isFormData: true });
      setStoredUser({ ...loggedInUser, ...data.user });
      showToast('Profile updated successfully!', 'success');
      modal.classList.add('hidden');
      loadProfile();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  });
}

function openEditModal(user) {
  document.getElementById('edit-name').value = user.name;
  document.getElementById('edit-bio').value = user.bio || '';
  document.getElementById('edit-avatar-preview').src = profileImgUrl(user.profile_picture);
  document.getElementById('edit-profile-modal').classList.remove('hidden');
}
