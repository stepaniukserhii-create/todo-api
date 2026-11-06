// ===== НАЛАШТУВАННЯ =====
// Встав СВІЙ базовий URL з mockapi.io (ресурс users), наприклад:
// const API_URL = 'https://6ab038adee9c55c910bf9b17.mockapi.io/users';
const API_URL = 'https://6aedb54ea677fe0fc14f467d.mockapi.io/users';

// Елементи сторінки
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const counter = document.getElementById('counter');
const statusMsg = document.getElementById('status');

// Масив завдань, який ми отримали з сервера
let tasks = [];

// Показує повідомлення (завантаження або помилку)
function showStatus(text, isError = false) {
    statusMsg.textContent = text;
    statusMsg.className = isError ? 'error' : '';
}

// GET: отримати список завдань з сервера
async function loadTasks() {
    showStatus('Завантаження...');
    try {
        const response = await fetch(API_URL);

        // Перевіряємо, чи сервер відповів успішно
        if (!response.ok) {
            throw new Error('сервер повернув код ' + response.status);
        }

        tasks = await response.json();
        showStatus('');
        render();
    } catch (error) {
        showStatus('Не вдалося завантажити: ' + error.message, true);
    }
}

// POST: надіслати нове завдання на сервер
async function addTask() {
    const text = taskInput.value.trim();

    // Порожнє завдання не відправляємо
    if (text === '') {
        showStatus('Напиши текст завдання', true);
        return;
    }

    addBtn.disabled = true; // блокуємо кнопку під час запиту
    showStatus('Додаємо...');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: text, completed: false })
        });

        if (!response.ok) {
            throw new Error('сервер повернув код ' + response.status);
        }

        taskInput.value = '';
        await loadTasks(); // оновлюємо список з сервера
    } catch (error) {
        showStatus('Не вдалося додати: ' + error.message, true);
    } finally {
        addBtn.disabled = false;
    }
}

// PUT: змінити стан завдання (виконано / не виконано) на сервері
async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: task.name, completed: !task.completed })
        });

        if (!response.ok) {
            throw new Error('сервер повернув код ' + response.status);
        }

        await loadTasks();
    } catch (error) {
        showStatus('Не вдалося оновити: ' + error.message, true);
    }
}

// DELETE: видалити завдання на сервері
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('сервер повернув код ' + response.status);
        }

        await loadTasks();
    } catch (error) {
        showStatus('Не вдалося видалити: ' + error.message, true);
    }
}

// Малюємо список завдань на сторінці
function render() {
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' done' : '');

        // Чекбокс для позначення виконаного
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        // Текст завдання (textContent, щоб не було проблем з HTML у тексті)
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.name;

        // Кнопка видалення
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        taskList.appendChild(li);
    });

    updateCounter();
}

// Лічильник завдань
function updateCounter() {
    const total = tasks.length;
    const notDone = tasks.filter(t => !t.completed).length;
    counter.textContent = `Усього: ${total} | Не виконано: ${notDone}`;
}

// Обробники подій
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// Завантажуємо список одразу при відкритті сторінки
loadTasks();
