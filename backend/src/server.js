require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes      = require('./routes/auth');
const employeeRoutes  = require('./routes/employees');
const attendanceRoutes= require('./routes/attendance');
const scheduleRoutes  = require('./routes/schedules');
const payrollRoutes   = require('./routes/payroll');
const accountingRoutes= require('./routes/accounting');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────────
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/schedules',  scheduleRoutes);
app.use('/api/payroll',    payrollRoutes);
app.use('/api/accounting', accountingRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── 404 ──────────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// ─── Error Handler ────────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Viking Grill API running on http://localhost:${PORT}`);
  console.log(`Allowing CORS from: ${allowedOrigin}`);
});

module.exports = app;
