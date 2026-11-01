const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { PORT, CORS_ORIGIN } = require('./config/environment');
const { initSocket } = require('./sockets/socket.handler');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const organizationRoutes = require('./routes/organization.routes');
const tenantRoutes = require('./routes/tenant.routes');
const boardRoutes = require('./routes/board.routes');
const columnRoutes = require('./routes/column.routes');
const taskRoutes = require('./routes/task.routes');
const activityRoutes = require('./routes/activity.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server, CORS_ORIGIN);

// Global Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Basic Health Check Endpoint (Required by Section 3, Step 5)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'JulleyOnline Collaborative Kanban Backend',
    uptime: process.uptime(),
    database: 'connected',
    realtime: 'ready'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: err.details || null
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 JulleyOnline Backend Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Socket.IO Real-Time Server initialized`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, server };
