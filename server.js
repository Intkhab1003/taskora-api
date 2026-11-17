// 1. Import required built-in and third-party modules
const express = require('express');
const path = require('path');
const crypto = require('crypto');

// 2. Initialize the Express application and define the server port
const app = express();
const PORT = process.env.PORT || 3000;

// 3. In-memory storage array (acts as our temporary RAM database)
let tasks = [];

// 4. Built-in Middleware
// Parses incoming JSON payloads from request bodies into req.body
app.use(express.json());

// Serves static frontend files (index.html, style.css, script.js) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// REST API ROUTES (/api/tasks)
// ============================================================================

/**
 * @route   GET /api/tasks
 * @desc    Retrieve all tasks from in-memory storage (returns [] if empty)
 * @access  Public
 */
app.get('/api/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    message: tasks.length === 0
      ? 'No tasks found. Your task list is currently empty.'
      : 'Tasks retrieved successfully.',
    data: tasks
  });
});

/**
 * @route   POST /api/tasks
 * @desc    Validate input, create a new task with unique ID, and return HTTP 201
 * @access  Public
 */
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;

  // Validate that title exists, is a string, and is not just blank spaces
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Task title is required and cannot be empty.',
      data: null
    });
  }

  // Construct the new task object
  const newTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  // Save to the in-memory array
  tasks.push(newTask);

  // Return HTTP 201 (Created) along with the newly created task
  return res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: newTask
  });
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Find a task by its URL parameter :id and delete it
 * @access  Public
 */
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  // Find the index position of the task matching the requested ID
  const taskIndex = tasks.findIndex((task) => task.id === id);

  // If findIndex returns -1, no task with that ID exists
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Task not found: No task exists with ID '${id}'.`,
      data: null
    });
  }

  // Remove the task from the array and capture the deleted item
  const [deletedTask] = tasks.splice(taskIndex, 1);

  // Return HTTP 200 (OK) confirming deletion
  return res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
    data: deletedTask
  });
});

// ============================================================================
// 404 NOT FOUND & GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================================================

// Catch-all handler for any undefined routes or endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl} does not exist.`,
    data: null
  });
});

// Global error-handling middleware (catches malformed JSON or unexpected server crashes)
app.use((err, req, res, next) => {
  // Handle invalid JSON syntax sent in a request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body.',
      data: null
    });
  }

  console.error('Server Error:', err.stack);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error.',
    data: null
  });
});

// 5. Start listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  TASKORA API Server running at http://localhost:${PORT}`);
  console.log(`  API Base Endpoint: http://localhost:${PORT}/api/tasks`);
  console.log('====================================================');
});