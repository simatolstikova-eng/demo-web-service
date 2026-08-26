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
        console.log('🔄 Загрузка клиентов...');
        const response = await fetch(`${API_BASE}/clients`, {
            headers: getHeaders()
        });
        console.log('📡 Ответ /clients:', response.status, response.statusText);

        if (response.ok) {
            const clients = await response.json();
            console.log('✅ Клиенты получены:', clients);
            renderClients(clients);
            updateStats(clients);
        } else {
            console.error('❌ Ошибка загрузки клиентов:', response.status);
            if (response.status === 401) {
                window.location.href = '/index.html';
            }
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки клиентов:', error);
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
            <td><span class="badge ${c.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}">${c.role}</span></td>
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
    document.getElementById('clientUsername').disabled = false; // для создания
    openModal('clientModal');
}

async function editClient(id) {
    try {
        console.log('🔄 Загрузка клиента для редактирования, id:', id);
        const response = await fetch(`${API_BASE}/clients/${id}`, {
            headers: getHeaders()
        });
        console.log('📡 Ответ /clients/${id}:', response.status, response.statusText);

        if (response.ok) {
            const client = await response.json();
            console.log('✅ Клиент загружен:', client);
            document.getElementById('clientModalTitle').textContent = 'Редактировать клиента';
            document.getElementById('clientId').value = client.id;
            document.getElementById('clientUsername').value = client.username;
            document.getElementById('clientUsername').disabled = true; // username нельзя менять
            document.getElementById('clientEmail').value = client.email;
            document.getElementById('clientFullName').value = client.fullName || '';
            document.getElementById('clientPhone').value = client.phone || '';
            openModal('clientModal');
        } else {
            showToast('Ошибка загрузки клиента: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки клиента:', error);
        showToast('Ошибка загрузки клиента', 'error');
    }
}

async function deleteClient(id) {
    if (!confirm('Удалить клиента?')) return;
    try {
        console.log('🔄 Удаление клиента, id:', id);
        const response = await fetch(`${API_BASE}/clients/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        console.log('📡 Ответ DELETE:', response.status, response.statusText);

        if (response.ok) {
            showToast('Клиент удалён');
            loadClients();
        } else {
            showToast('Ошибка удаления: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showToast('Ошибка удаления', 'error');
    }
}

// Обработчик формы клиента (СОЗДАНИЕ И ОБНОВЛЕНИЕ)
document.getElementById('clientForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('clientId').value;

    // ✅ username всегда берётся из поля (даже если disabled)
    const username = document.getElementById('clientUsername').value;
    const email = document.getElementById('clientEmail').value;
    const fullName = document.getElementById('clientFullName').value;
    const phone = document.getElementById('clientPhone').value;

    const data = {
        username: username,
        email: email,
        fullName: fullName,
        phone: phone
    };

    console.log('📤 Отправка данных клиента:', data);
    console.log('📤 ID клиента:', id || 'новый');

    try {
        const url = id ? `${API_BASE}/clients/${id}` : `${API_BASE}/clients`;
        const method = id ? 'PUT' : 'POST';

        console.log('📤 URL:', url);
        console.log('📤 Method:', method);

        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        console.log('📡 Ответ сервера:', response.status, response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Результат:', result);
            showToast(id ? 'Клиент обновлён' : 'Клиент создан');
            closeModal('clientModal');
            document.getElementById('clientUsername').disabled = false; // возвращаем как было
            loadClients();
        } else {
            const errorText = await response.text();
            console.error('❌ Ошибка сервера:', errorText);
            showToast('Ошибка сохранения: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Исключение при сохранении:', error);
        showToast('Ошибка сохранения', 'error');
    }
});

// ========================================
// 5. РАБОТА С ТОВАРАМИ
// ========================================

async function loadProducts() {
    try {
        console.log('🔄 Загрузка товаров...');
        const response = await fetch(`${API_BASE}/products`, {
            headers: getHeaders()
        });
        console.log('📡 Ответ /products:', response.status, response.statusText);

        if (response.ok) {
            const products = await response.json();
            console.log('✅ Товары получены:', products);
            renderProducts(products);
        } else {
            console.error('❌ Ошибка загрузки товаров:', response.status);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки товаров:', error);
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
        console.log('🔄 Загрузка товара для редактирования, id:', id);
        const response = await fetch(`${API_BASE}/products/${id}`, {
            headers: getHeaders()
        });
        console.log('📡 Ответ /products/${id}:', response.status, response.statusText);

        if (response.ok) {
            const product = await response.json();
            console.log('✅ Товар загружен:', product);
            document.getElementById('productModalTitle').textContent = 'Редактировать товар';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productQuantity').value = product.quantity;
            document.getElementById('productCategory').value = product.category || '';
            openModal('productModal');
        } else {
            showToast('Ошибка загрузки товара: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки товара:', error);
        showToast('Ошибка загрузки товара', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    try {
        console.log('🔄 Удаление товара, id:', id);
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        console.log('📡 Ответ DELETE:', response.status, response.statusText);

        if (response.ok) {
            showToast('Товар удалён');
            loadProducts();
        } else {
            showToast('Ошибка удаления: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showToast('Ошибка удаления', 'error');
    }
}

// Обработчик формы товара (СОЗДАНИЕ И ОБНОВЛЕНИЕ)
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

    console.log('📤 Отправка данных товара:', data);
    console.log('📤 ID товара:', id || 'новый');

    try {
        const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
        const method = id ? 'PUT' : 'POST';

        console.log('📤 URL:', url);
        console.log('📤 Method:', method);

        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        console.log('📡 Ответ сервера:', response.status, response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Результат:', result);
            showToast(id ? 'Товар обновлён' : 'Товар создан');
            closeModal('productModal');
            loadProducts();
        } else {
            const errorText = await response.text();
            console.error('❌ Ошибка сервера:', errorText);
            showToast('Ошибка сохранения: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Исключение при сохранении:', error);
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
        console.log('🔄 Загрузка статистики...');
        const response = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: getHeaders()
        });
        console.log('📡 Ответ /admin/dashboard:', response.status, response.statusText);

        if (response.ok) {
            const stats = await response.json();
            console.log('✅ Статистика:', stats);
            document.getElementById('totalClients').textContent = stats.totalClients || 0;
            document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
            document.getElementById('activeClients').textContent = stats.activeClients || 0;
        } else {
            console.error('❌ Ошибка загрузки статистики:', response.status);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки статистики:', error);
    }
}

// ========================================
// 7. ИНИЦИАЛИЗАЦИЯ
// ========================================

// При загрузке dashboard
if (window.location.pathname.includes('dashboard.html')) {
    console.log('🚀 Загрузка Dashboard');
    checkAuth();
    document.getElementById('userName').textContent = localStorage.getItem('username') || 'Пользователь';
    loadStats();
    loadClients();
    loadProducts();
}

// При загрузке страницы входа
if (window.location.pathname.includes('index.html')) {
    console.log('🚀 Загрузка страницы входа');
    if (localStorage.getItem('token')) {
        window.location.href = '/dashboard.html';
    }
}