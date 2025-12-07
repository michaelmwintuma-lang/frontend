// handle registration form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';
    
    try {
      const res = await window.api.registerUser(name, email, password);
      submitBtn.textContent = 'Success!';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert(err.message || 'Register failed');
    }
  });
}

// handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
      const res = await window.api.loginUser(email, password);
      if (res.user) {
        sessionStorage.setItem('user', JSON.stringify(res.user));
        submitBtn.textContent = 'Success!';
        setTimeout(() => {
          window.location.href = '../dashboard.html';
        }, 500);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        alert('Login failed: Invalid response');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert(err.message || 'Login failed');
    }
  });
}
