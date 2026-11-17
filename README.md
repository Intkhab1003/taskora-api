# TASKORA API — RESTful Task Engine & Futuristic Dashboard

**TASKORA API** is a full-stack task management application and interactive REST API explorer built with **Node.js**, **Express.js**, and **Vanilla JavaScript** as part of my **Webora Tec Internship (Week 4, Task 2)**.

Unlike browser-only task apps that rely on `localStorage`, TASKORA uses a unified client-server architecture where the Express backend acts as the single source of truth via an in-memory data store.

---

## Key Features

### Backend (Node.js & Express.js)
* **RESTful Endpoints:** Clean `GET`, `POST`, and `DELETE` routes under `/api/tasks`.
* **Input Validation:** Rejects empty or whitespace-only task titles with `HTTP 400 Bad Request`.
* **Unique Identifiers:** Generates cryptographically unique UUIDs (`crypto.randomUUID()`) for every created task.
* **Standardized JSON Responses:** Consistent `{ success, message, data }` payload structure across all routes.
* **Middleware & Error Handling:** Configured with `express.json()`, static frontend serving from `public/`, JSON 404 route handling, and global syntax/server error middleware.

### Frontend (HTML5, CSS3 & Vanilla JavaScript)
* **100% Backend-Driven State:** Every UI action calls the Express server live via asynchronous `fetch()` requests.
* **Live Telemetry Dashboard:** Calculates Total, Pending, and Completed task counts directly from server data.
* **Futuristic Glassmorphic UI:** Dark navy/charcoal aesthetic with purple-to-cyan gradients, floating task cards, and responsive layout.
* **Interactive API Endpoint Explorer:** Built-in `GET`, `POST`, and `DELETE` triggers with a live JSON response viewer, HTTP status badge, and one-click **Copy JSON** button.

---

## Important Note on Data Persistence

> **In-Memory Storage Behavior:** TASKORA stores tasks inside an in-memory JavaScript array (`let tasks = [];`) on the server rather than a database. Because data lives in server RAM, **all tasks automatically reset back to `[]` whenever the Node.js server restarts**.

---

## Project Folder Structure

```text
TASKORA-API/
├── public/                 # Static frontend served by Express
│   ├── index.html          # Semantic dashboard structure & API Explorer
│   ├── style.css           # Dark glassmorphic purple/cyan theme
│   └── script.js           # Client-side fetch() logic & DOM updates
├── server.js               # Express server, middleware & REST API routes
├── package.json            # Dependencies (express, nodemon) & npm scripts
├── package-lock.json       # Locked dependency tree
├── .gitignore              # Excludes node_modules/ and system files from Git
└── README.md               # Project documentation
```

---

## Installation & Execution

### 1. Clone the Repository
```bash
git clone [https://github.com/](https://github.com/)<your-github-Intkhab1003>/taskora-api.git
cd taskora-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Application
* **Development Mode (auto-restarts on file save via Nodemon):**
  ```bash
  npm run dev
  ```
* **Standard / Production Mode:**
  ```bash
  npm start
  ```

Once running, open **`http://localhost:3000`** in your browser.

---

## REST API Endpoints & Examples

| Method | Endpoint | Description | Success | Error |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Retrieve all tasks (`[]` if empty) | `200 OK` | `500 Server Error` |
| `POST` | `/api/tasks` | Create a new task | `201 Created` | `400 Bad Request` |
| `DELETE` | `/api/tasks/:id` | Delete a task by its UUID | `200 OK` | `404 Not Found` |

### 1. `GET /api/tasks`
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully.",
  "data": [
    {
      "id": "3b241101-e2bb-4255-8caf-4136c566a962",
      "title": "Complete Webora Tec Week 4 API",
      "completed": false,
      "createdAt": "2026-11-17T04:15:00.000Z"
    }
  ]
}
```

### 2. `POST /api/tasks`
**Request Headers:** `Content-Type: application/json`  
**Request Body:**
```json
{
  "title": "Complete Webora Tec Week 4 API"
}
```
**Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "id": "3b241101-e2bb-4255-8caf-4136c566a962",
    "title": "Complete Webora Tec Week 4 API",
    "completed": false,
    "createdAt": "2026-11-17T04:15:00.000Z"
  }
}
```
**Validation Error Response (`400 Bad Request` when `title` is empty):**
```json
{
  "success": false,
  "message": "Validation failed: Task title is required and cannot be empty.",
  "data": null
}
```

### 3. `DELETE /api/tasks/:id`
**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task deleted successfully.",
  "data": {
    "id": "3b241101-e2bb-4255-8caf-4136c566a962",
    "title": "Complete Webora Tec Week 4 API",
    "completed": false,
    "createdAt": "2026-11-17T04:15:00.000Z"
  }
}
```
**Missing ID Response (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Task not found: No task exists with ID 'invalid-id'.",
  "data": null
}
```

---

## Testing with Postman

1. Start the server with `npm run dev`.
2. Open **Postman** and run the following verification sequence:
   * **GET All Tasks:** `GET http://localhost:3000/api/tasks` → Verify `200 OK` and `"data": []`.
   * **POST Valid Task:** `POST http://localhost:3000/api/tasks` with raw JSON `{"title": "Test Task"}` → Verify `201 Created` and copy the returned `id`.
   * **POST Empty Title:** `POST http://localhost:3000/api/tasks` with raw JSON `{"title": ""}` → Verify `400 Bad Request`.
   * **DELETE Valid Task:** `DELETE http://localhost:3000/api/tasks/<copied-id>` → Verify `200 OK`.
   * **DELETE Missing Task:** `DELETE http://localhost:3000/api/tasks/missing-id` → Verify `404 Not Found`.
   * **GET Confirmation:** `GET http://localhost:3000/api/tasks` → Verify `200 OK` and `"data": []`.

---

## Author

**Khabii** — Computer Science Graduate & Web Development Intern at **Webora Tec**