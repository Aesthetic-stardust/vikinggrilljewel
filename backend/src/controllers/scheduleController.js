const pool = require('../config/db');

const getAllSchedules = async (req, res, next) => {
  try {
    const { week, employeeId } = req.query;

    let sql = `
      SELECT s.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, e.position
      FROM schedules s
      JOIN employees e ON e.id = s.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (week)       { sql += ' AND s.week = ?';        params.push(week); }
    if (employeeId) { sql += ' AND s.employee_id = ?'; params.push(employeeId); }

    sql += ' ORDER BY e.last_name';

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(toSchedule));
  } catch (err) {
    next(err);
  }
};

const createOrUpdateSchedule = async (req, res, next) => {
  try {
    const { employeeId, week, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
    if (!employeeId || !week) {
      return res.status(400).json({ message: 'employeeId and week are required.' });
    }

    const days = {
      monday:    monday    || 'Off',
      tuesday:   tuesday   || 'Off',
      wednesday: wednesday || 'Off',
      thursday:  thursday  || 'Off',
      friday:    friday    || 'Off',
      saturday:  saturday  || 'Off',
      sunday:    sunday    || 'Off',
    };

    await pool.query(
      `INSERT INTO schedules (employee_id, week, monday, tuesday, wednesday, thursday, friday, saturday, sunday)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         monday    = VALUES(monday),
         tuesday   = VALUES(tuesday),
         wednesday = VALUES(wednesday),
         thursday  = VALUES(thursday),
         friday    = VALUES(friday),
         saturday  = VALUES(saturday),
         sunday    = VALUES(sunday)`,
      [employeeId, week, days.monday, days.tuesday, days.wednesday, days.thursday, days.friday, days.saturday, days.sunday]
    );

    const [rows] = await pool.query(
      `SELECT s.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, e.position
       FROM schedules s JOIN employees e ON e.id = s.employee_id
       WHERE s.employee_id = ? AND s.week = ?`,
      [employeeId, week]
    );

    res.status(201).json(toSchedule(rows[0]));
  } catch (err) {
    next(err);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const [check] = await pool.query('SELECT id FROM schedules WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ message: 'Schedule not found.' });

    await pool.query('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    res.json({ message: 'Schedule deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────────
function toSchedule(row) {
  if (!row) return null;
  return {
    id:           row.id,
    employeeId:   row.employee_id,
    employeeName: row.employee_name || undefined,
    position:     row.position      || undefined,
    week:         row.week,
    monday:       row.monday,
    tuesday:      row.tuesday,
    wednesday:    row.wednesday,
    thursday:     row.thursday,
    friday:       row.friday,
    saturday:     row.saturday,
    sunday:       row.sunday,
  };
}

module.exports = { getAllSchedules, createOrUpdateSchedule, deleteSchedule };
