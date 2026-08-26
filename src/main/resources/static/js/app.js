// ========================================
// 1. ОСНОВНЫЕ НАСТРОЙКИ
// ========================================

const API_BASE = 'http://localhost:8080/api';
let authToken = localStorage.getItem('token');

// ========================================
// 2. РАБОТА С АВТОРИЗАЦИЕЙ
// ========================================

// Вход
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            window.location.href = '/dashboard.html';
        } else {
            errorEl.textContent = '❌ Неверный логин или пароль';
            errorEl.style.display = 'block';
        }
    } catch (error) {
        errorEl.textContent = '❌ Ошибка подключения к серверу';
        errorEl.style.display = 'block';
    }
});

// Выход
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/index.html';
}

// Проверка авторизации
function checkAuth() {
    if (!localStorage.getItem('token') && !window.location.pathname.includes('index.html')) {
        window.location.href = '/index.html';
    }
}

// ========================================
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU');
}

// Закрытие модалки по клику вне её
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

// ========================================
// 4. РАБОТА С КЛИЕНТАМИ
// ========================================

async function loadClients() {
    try {
        const response = await fetch(`${API_BASE}/clients`, {
            headers: getHeaders()
        });
        if (response.ok) {
            const clients = await response.json();
            renderClients(clients);
            updateStats(clients);
        }
    } catch (error) {
        console.error('Ошибка загрузки клиентов:', error);
    }
}

function renderClients(clients) {
    const tbody = document.getElementById('clientsTableBody');
    if (!clients || clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Нет клиентов</td></tr>';
        return;
    }
    tbody.innerHTML = clients.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.username}</td>
            <td>${c.email}</td>
            <td>${c.fullName || '-'}</td>
            <td>${c.phone || '-'}</td>
            <td><span class="badge ${c.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'}">${c.role}</span></td>
            <td>
                <div class="actions">
                    <button class="btn btn-warning btn-sm" onclick="editClient(${c.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteClient(${c.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showAddClientModal() {
    document.getElementById('clientModalTitle').textContent = 'Добавить клиента';
    document.getElementById('clientId').value = '';
    document.getElementById('clientForm').reset();
    openModal('clientModal');
}

async function editClient(id) {
    try {
        const response = await fetch(`${API_BASE}/clients/${id}`, {
            headers: getHeaders()
        });
        if (response.ok) {
            const client = await response.json();
            document.getElementById('clientModalTitle').textContent = 'Редактировать клиента';
            document.getElementById('clientId').value = client.id;
            document.getElementById('clientUsername').value = client.username;
            document.getElementById('clientEmail').value = client.email;
            document.getElementById('clientFullName').value = client.fullName || '';
            document.getElementById('clientPhone').value = client.phone || '';
            openModal('clientModal');
        }
    } catch (error) {
        showToast('Ошибка загрузки клиента', 'error');
    }
}

async function deleteClient(id) {
    if (!confirm('Удалить клиента?')) return;
    try {
        const response = await fetch(`${API_BASE}/clients/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (response.ok) {
            showToast('Клиент удалён');
            loadClients();
        }
    } catch (error) {
        showToast('Ошибка удаления', 'error');
    }
}

document.getElementById('clientForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('clientId').value;
    const data = {
        username: document.getElementById('clientUsername').value,
        email: document.getElementById('clientEmail').value,
        fullName: document.getElementById('clientFullName').value,
        phone: document.getElementById('clientPhone').value
    };

    try {
        const url = id ? `${API_BASE}/clients/${id}` : `${API_BASE}/clients`;
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (response.ok) {
            showToast(id ? 'Клиент обновлён' : 'Клиент создан');
            closeModal('clientModal');
            loadClients();
        }
    } catch (error) {
        showToast('Ошибка сохранения', 'error');
    }
});

// ========================================
// 5. РАБОТА С ТОВАРАМИ
// ========================================

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`, {
            headers: getHeaders()
        });
        if (response.ok) {
            const products = await response.json();
            renderProducts(products);
        }
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Нет товаров</td></tr>';
        return;
    }
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.description || '-'}</td>
            <td>${p.price} ₽</td>
            <td>${p.quantity}</td>
            <td>${p.category || '-'}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-warning btn-sm" onclick="editProduct(${p.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Добавить товар';
    document.getElementById('productId').value = '';
    document.getElementById('productForm').reset();
    openModal('productModal');
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            headers: getHeaders()
        });
        if (response.ok) {
            const product = await response.json();
            document.getElementById('productModalTitle').textContent = 'Редактировать товар';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productQuantity').value = product.quantity;
            document.getElementById('productCategory').value = product.category || '';
            openModal('productModal');
        }
    } catch (error) {
        showToast('Ошибка загрузки товара', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (response.ok) {
            showToast('Товар удалён');
            loadProducts();
        }
    } catch (error) {
        showToast('Ошибка удаления', 'error');
    }
}

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        category: document.getElementById('productCategory').value
    };

    try {
        const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (response.ok) {
            showToast(id ? 'Товар обновлён' : 'Товар создан');
            closeModal('productModal');
            loadProducts();
        }
    } catch (error) {
        showToast('Ошибка сохранения', 'error');
    }
});

// ========================================
// 6. СТАТИСТИКА
// ========================================

function updateStats(clients) {
    const totalClients = document.getElementById('totalClients');
    const activeClients = document.getElementById('activeClients');
    if (totalClients) totalClients.textContent = clients?.length || 0;
    if (activeClients) activeClients.textContent = clients?.filter(c => c.active).length || 0;
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: getHeaders()
        });
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalClients').textContent = stats.totalClients || 0;
            document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
            document.getElementById('activeClients').textContent = stats.activeClients || 0;
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// ========================================
// 7. ИНИЦИАЛИЗАЦИЯ
// ========================================

// При загрузке dashboard
if (window.location.pathname.includes('dashboard.html')) {
    checkAuth();
    document.getElementById('userName').textContent = localStorage.getItem('username') || 'Пользователь';
    loadStats();
    loadClients();
    loadProducts();
}

// При загрузке страницы входа
if (window.location.pathname.includes('index.html')) {
    // Если уже авторизован — перенаправить в дашборд
    if (localStorage.getItem('token')) {
        window.location.href = '/dashboard.html';
    }
}