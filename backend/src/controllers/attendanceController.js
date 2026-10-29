const pool = require('../config/db');

const getAllAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.query;

    // Employees see only their own records
    const effectiveEmployeeId =
      req.user.role === 'employee' ? req.user.employeeId : (employeeId || null);

    let sql = `
      SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM attendance a
      JOIN employees e ON e.id = a.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (effectiveEmployeeId) { sql += ' AND a.employee_id = ?';  params.push(effectiveEmployeeId); }
    if (date)                 { sql += ' AND a.date = ?';         params.push(date); }
    if (status)               { sql += ' AND a.status = ?';       params.push(status); }

    sql += ' ORDER BY a.date DESC, e.last_name';

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(toAttendance));
  } catch (err) {
    next(err);
  }
};

const recordAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, timeIn, timeOut, status } = req.body;
    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: 'employeeId, date, and status are required.' });
    }

    let hoursWorked = 0;
    if (timeIn && timeOut) {
      const [inH, inM]   = timeIn.split(':').map(Number);
      const [outH, outM] = timeOut.split(':').map(Number);
      hoursWorked = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;
    }

    // Upsert: update if same employee+date exists, otherwise insert
    await pool.query(
      `INSERT INTO attendance (employee_id, date, time_in, time_out, status, hours_worked)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         time_in      = VALUES(time_in),
         time_out     = VALUES(time_out),
         status       = VALUES(status),
         hours_worked = VALUES(hours_worked)`,
      [employeeId, date, timeIn || null, timeOut || null, status, hoursWorked]
    );

    const [rows] = await pool.query(
      `SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
       FROM attendance a JOIN employees e ON e.id = a.employee_id
       WHERE a.employee_id = ? AND a.date = ?`,
      [employeeId, date]
    );

    const code = req.method === 'POST' ? 201 : 200;
    res.status(code).json(toAttendance(rows[0]));
  } catch (err) {
    next(err);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        a.employee_id                                                  AS employeeId,
        CONCAT(e.first_name, ' ', e.last_name)                        AS employeeName,
        SUM(a.status = 'present')                                      AS present,
        SUM(a.status = 'absent')                                       AS absent,
        SUM(a.status = 'late')                                         AS late,
        ROUND(SUM(a.hours_worked), 2)                                  AS totalHours
      FROM attendance a
      JOIN employees e ON e.id = a.employee_id
      GROUP BY a.employee_id, e.first_name, e.last_name
      ORDER BY e.last_name
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────────
function toAttendance(row) {
  if (!row) return null;
  return {
    id:           row.id,
    employeeId:   row.employee_id,
    employeeName: row.employee_name || undefined,
    date:         row.date,
    timeIn:       row.time_in,
    timeOut:      row.time_out,
    status:       row.status,
    hoursWorked:  parseFloat(row.hours_worked),
  };
}

module.exports = { getAllAttendance, recordAttendance, getAttendanceSummary };
