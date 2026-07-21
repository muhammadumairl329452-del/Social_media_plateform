// ============================================
// Auth Page Logic (login.html & register.html)
// ============================================

// Redirect to feed if already logged in
if (isLoggedIn() && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html'))) {
  window.location.href = 'index.html';
}

// ---------- Register Form ----------
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('error-msg');
    errorEl.classList.remove('show');

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
      errorEl.textContent = 'Passwords do not match.';
      errorEl.classList.add('show');
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password }
      });
      setToken(data.token);
      setStoredUser(data.user);
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    }
  });
}

// ---------- Login Form ----------
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('error-msg');
    errorEl.classList.remove('show');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      setToken(data.token);
      setStoredUser(data.user);
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
    }
  });
}
