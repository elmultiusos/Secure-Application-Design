/**
 * app.js — Async client for Secure Application Design
 *
 * 12-factor config: set API_URL via window.API_URL before this script loads,
 * or override the SPRING_API_URL constant below to match your Spring server.
 *
 * Example (add before <script src="app.js"> in index.html):
 *   <script>window.API_URL = 'https://your-spring-server.duckdns.org:8443';</script>
 */

// ── Configuration ──────────────────────────────────────────────────────────────
const API_URL = window.API_URL || 'https://localhost:8443';

// ── Tab switching ───────────────────────────────────────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
    });
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    clearAlerts();
}

function clearAlerts() {
    ['login-alert', 'reg-alert'].forEach(id => {
        const el = document.getElementById(id);
        el.style.display = 'none';
        el.className = 'alert';
        el.textContent = '';
    });
}

// ── Alert helper ────────────────────────────────────────────────────────────────
function showAlert(id, message, type) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.className = `alert ${type}`;
    el.style.display = 'block';
}

// ── Button loading state ────────────────────────────────────────────────────────
function setLoading(btnId, loading, originalText) {
    const btn = document.getElementById(btnId);
    if (loading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span>Procesando...`;
    } else {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// ── API helper ──────────────────────────────────────────────────────────────────
async function apiPost(path, payload) {
    const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // credentials: 'include' — enable if using session cookies
    });

    const text = await response.text();
    return { ok: response.ok, status: response.status, body: text };
}

// ── Login handler ───────────────────────────────────────────────────────────────
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;

    setLoading('login-btn', true);
    clearAlerts();

    try {
        const { ok, status, body } = await apiPost('/api/auth/login', { username, password });

        if (ok) {
            showAlert('login-alert', `✅ ${body}`, 'success');
        } else if (status === 401) {
            showAlert('login-alert', '❌ Credenciales inválidas. Verifica tu usuario y contraseña.', 'error');
        } else {
            showAlert('login-alert', `⚠️ Error ${status}: ${body}`, 'error');
        }
    } catch (err) {
        showAlert('login-alert',
            `⚠️ No se pudo conectar con el servidor.\n` +
            `Verifica que el servidor Spring esté corriendo en:\n${API_URL}\n\n` +
            `Detalle: ${err.message}`,
            'error'
        );
    } finally {
        setLoading('login-btn', false, 'Iniciar Sesión');
    }
}

// ── Register handler ────────────────────────────────────────────────────────────
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('reg-user').value.trim();
    const password = document.getElementById('reg-pass').value;

    if (password.length < 6) {
        showAlert('reg-alert', '⚠️ La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    setLoading('reg-btn', true);
    clearAlerts();

    try {
        const { ok, status, body } = await apiPost('/api/auth/register', { username, password });

        if (ok) {
            showAlert('reg-alert', `✅ ${body} Ahora puedes iniciar sesión.`, 'success');
            document.getElementById('register-form').reset();
            setTimeout(() => switchTab('login'), 2000);
        } else if (status === 409) {
            showAlert('reg-alert', '❌ Ese usuario ya existe. Elige otro nombre de usuario.', 'error');
        } else if (status === 400) {
            showAlert('reg-alert', `⚠️ ${body}`, 'error');
        } else {
            showAlert('reg-alert', `⚠️ Error ${status}: ${body}`, 'error');
        }
    } catch (err) {
        showAlert('reg-alert',
            `⚠️ No se pudo conectar con el servidor.\n` +
            `Verifica que el servidor Spring esté corriendo en:\n${API_URL}\n\n` +
            `Detalle: ${err.message}`,
            'error'
        );
    } finally {
        setLoading('reg-btn', false, 'Crear Cuenta');
    }
}
