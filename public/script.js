// ============================================================================
// TASKORA FRONTEND ENGINE — 100% BACKEND-DRIVEN VIA FETCH()
// ============================================================================

const API_BASE = '/api/tasks';

// DOM References
const taskGrid = document.getElementById('task-grid');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const feedbackBanner = document.getElementById('feedback-banner');
const feedbackBadge = document.getElementById('feedback-badge');
const feedbackMessage = document.getElementById('feedback-message');

const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');
const serverStatusText = document.getElementById('server-status-text');

const createTaskForm = document.getElementById('create-task-form');
const taskTitleInput = document.getElementById('task-title-input');
const createTaskBtn = document.getElementById('create-task-btn');
const refreshTasksBtn = document.getElementById('refresh-tasks-btn');

// API Explorer References
const explorerGetBtn = document.getElementById('explorer-get-btn');
const explorerPostBtn = document.getElementById('explorer-post-btn');
const explorerPostBody = document.getElementById('explorer-post-body');
const explorerDeleteBtn = document.getElementById('explorer-delete-btn');
const explorerDeleteId = document.getElementById('explorer-delete-id');

// JSON Viewer References
const responseRoute = document.getElementById('response-route');
const httpStatusBadge = document.getElementById('http-status-badge');
const jsonOutput = document.getElementById('json-output');
const copyJsonBtn = document.getElementById('copy-json-btn');

let lastRawJson = '';

// Safely escape user-supplied text before inserting into HTML
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Show success or error notification banner
function showFeedback(type, badgeText, message) {
  feedbackBanner.className = `feedback-banner ${type}`;
  feedbackBadge.textContent = badgeText;
  feedbackMessage.textContent = message;
}

// Update the live JSON Response Viewer and HTTP Status Badge
function updateResponseViewer(method, url, status, statusText, payload) {
  responseRoute.textContent = `${method} ${url}`;
  httpStatusBadge.textContent = `${status} ${statusText}`;

  if (status >= 200 && status < 300) {
    httpStatusBadge.className = 'status-pill status-ok';
  } else {
    httpStatusBadge.className = 'status-pill status-err';
  }

  lastRawJson = JSON.stringify(payload, null, 2);
  jsonOutput.textContent = lastRawJson;
}

// Calculate dashboard metrics directly from the real backend task array
function updateDashboardStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed === true).length;
  const pending = tasks.filter((t) => t.completed === false).length;

  statTotal.textContent = total;
  statPending.textContent = pending;
  statCompleted.textContent = completed;
}

// Render 3D floating task cards from backend data
function renderTasks(tasks) {
  updateDashboardStats(tasks);

  if (!tasks || tasks.length === 0) {
    taskGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  taskGrid.innerHTML = tasks
    .map((task) => {
      const statusLabel = task.completed ? 'Completed' : 'Pending';
      const statusClass = task.completed ? 'task-status completed' : 'task-status';
      const formattedTime = task.createdAt
        ? new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'Active Session';

      return `
        <article class="task-card" data-id="${escapeHTML(task.id)}">
          <div>
            <div class="task-card-top">
              <span class="${statusClass}">${statusLabel}</span>
              <span
                class="task-id-pill"
                title="Click to load ID into API Explorer: ${escapeHTML(task.id)}"
                onclick="selectTaskIdForExplorer('${escapeHTML(task.id)}')"
              >
                ID: ${escapeHTML(task.id)}
              </span>
            </div>
            <h3 class="task-title" style="margin-top: 0.85rem;">${escapeHTML(task.title)}</h3>
          </div>

          <div class="task-card-actions">
            <span class="task-meta">Created ${escapeHTML(formattedTime)}</span>
            <button
              type="button"
              class="btn btn-danger btn-sm"
              onclick="deleteTask('${escapeHTML(task.id)}')"
            >
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

// Helper: Clicking a task's ID badge loads it into the API Explorer DELETE input
window.selectTaskIdForExplorer = function (id) {
  explorerDeleteId.value = id;
  showFeedback('success', 'ID COPIED', `Loaded task ID ${id} into the API Explorer DELETE field.`);
};

// ============================================================================
// 1. GET /api/tasks — Fetch all tasks from Express backend
// ============================================================================
async function fetchTasks(logToViewer = true) {
  loadingState.classList.remove('hidden');
  emptyState.classList.add('hidden');

  try {
    const response = await fetch(API_BASE);
    const result = await response.json();

    serverStatusText.textContent = 'API ONLINE :3000';

    if (logToViewer) {
      updateResponseViewer('GET', API_BASE, response.status, response.statusText, result);
    }

    if (response.ok && result.success) {
      renderTasks(result.data);
    } else {
      showFeedback('error', `HTTP ${response.status}`, result.message || 'Failed to retrieve tasks.');
    }
  } catch (error) {
    serverStatusText.textContent = 'API OFFLINE';
    showFeedback('error', 'NETWORK ERROR', 'Could not reach Express server. Ensure npm run dev is running.');
  } finally {
    loadingState.classList.add('hidden');
  }
}

// ============================================================================
// 2. POST /api/tasks — Create a new task on Express backend
// ============================================================================
async function createTask(titleValue) {
  createTaskBtn.disabled = true;

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: titleValue })
    });

    const result = await response.json();
    updateResponseViewer('POST', API_BASE, response.status, response.statusText, result);

    if (response.status === 201 && result.success) {
      taskTitleInput.value = '';
      showFeedback('success', '201 CREATED', result.message);
      await fetchTasks(false);
    } else {
      showFeedback('error', `HTTP ${response.status}`, result.message || 'Invalid task input.');
    }
  } catch (error) {
    showFeedback('error', 'NETWORK ERROR', 'Unable to send POST request to server.');
  } finally {
    createTaskBtn.disabled = false;
  }
}

// ============================================================================
// 3. DELETE /api/tasks/:id — Delete a task by ID on Express backend
// ============================================================================
window.deleteTask = async function (id) {
  const cleanId = encodeURIComponent(id.trim());
  const endpoint = `${API_BASE}/${cleanId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE'
    });

    const result = await response.json();
    updateResponseViewer('DELETE', `/api/tasks/${id.trim()}`, response.status, response.statusText, result);

    if (response.ok && result.success) {
      showFeedback('success', '200 OK', result.message);
      await fetchTasks(false);
    } else {
      showFeedback('error', `HTTP ${response.status}`, result.message || 'Task deletion failed.');
    }
  } catch (error) {
    showFeedback('error', 'NETWORK ERROR', 'Unable to send DELETE request to server.');
  }
};

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Task Creation Form Submit
createTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  createTask(taskTitleInput.value);
});

// Refresh Button
refreshTasksBtn.addEventListener('click', () => {
  fetchTasks(true);
});

// Explorer: GET Trigger
explorerGetBtn.addEventListener('click', () => {
  fetchTasks(true);
});

// Explorer: POST Trigger
explorerPostBtn.addEventListener('click', async () => {
  try {
    const parsedBody = JSON.parse(explorerPostBody.value);
    await createTask(parsedBody.title ?? '');
  } catch (err) {
    showFeedback('error', 'JSON SYNTAX', 'Invalid JSON inside the Explorer POST body editor.');
  }
});

// Explorer: DELETE Trigger
explorerDeleteBtn.addEventListener('click', () => {
  const targetId = explorerDeleteId.value.trim();
  if (!targetId) {
    showFeedback('error', 'INPUT REQUIRED', 'Enter a task UUID or a fake ID in the DELETE field first.');
    return;
  }
  window.deleteTask(targetId);
});

// Copy JSON Response Button
copyJsonBtn.addEventListener('click', async () => {
  if (!lastRawJson) return;
  try {
    await navigator.clipboard.writeText(lastRawJson);
    copyJsonBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyJsonBtn.textContent = 'Copy JSON';
    }, 1600);
  } catch (err) {
    showFeedback('error', 'CLIPBOARD', 'Could not copy JSON to clipboard.');
  }
});

// Initial load on page open
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks(true);
});