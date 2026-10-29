const pool = require('../config/db');

const getAllEmployees = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY last_name, first_name');
    res.json(rows.map(toEmployee));
  } catch (err) {
    next(err);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    // Employees can only view their own record
    if (req.user.role === 'employee' && req.user.employeeId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own record.' });
    }

    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Employee not found.' });
    res.json(toEmployee(rows[0]));
  } catch (err) {
    next(err);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, position, department, hireDate, salary, address } = req.body;
    if (!firstName || !lastName || !email || !position || !department) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const [result] = await pool.query(
      `INSERT INTO employees
         (first_name, last_name, email, phone, position, department, status, hire_date, salary, address)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [
        firstName, lastName, email,
        phone    || '',
        position, department,
        hireDate || new Date().toISOString().split('T')[0],
        salary   || 0,
        address  || '',
      ]
    );

    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json(toEmployee(rows[0]));
  } catch (err) {
    next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, position, department, status, hireDate, salary, address } = req.body;

    const [check] = await pool.query('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ message: 'Employee not found.' });

    await pool.query(
      `UPDATE employees SET
         first_name = COALESCE(?, first_name),
         last_name  = COALESCE(?, last_name),
         email      = COALESCE(?, email),
         phone      = COALESCE(?, phone),
         position   = COALESCE(?, position),
         department = COALESCE(?, department),
         status     = COALESCE(?, status),
         hire_date  = COALESCE(?, hire_date),
         salary     = COALESCE(?, salary),
         address    = COALESCE(?, address)
       WHERE id = ?`,
      [
        firstName  ?? null,
        lastName   ?? null,
        email      ?? null,
        phone      ?? null,
        position   ?? null,
        department ?? null,
        status     ?? null,
        hireDate   ?? null,
        salary     ?? null,
        address    ?? null,
        req.params.id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json(toEmployee(rows[0]));
  } catch (err) {
    next(err);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const [check] = await pool.query('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ message: 'Employee not found.' });

    await pool.query("UPDATE employees SET status = 'inactive' WHERE id = ?", [req.params.id]);
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deactivated.', employee: toEmployee(rows[0]) });
  } catch (err) {
    next(err);
  }
};

const getHRStats = async (req, res, next) => {
  try {
    const [[{ total }]]  = await pool.query('SELECT COUNT(*) AS total FROM employees');
    const [[{ active }]] = await pool.query("SELECT COUNT(*) AS active FROM employees WHERE status = 'active'");
    const [[{ depts }]]  = await pool.query('SELECT COUNT(DISTINCT department) AS depts FROM employees');

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoff = threeMonthsAgo.toISOString().split('T')[0];
    const [[{ recentHires }]] = await pool.query(
      'SELECT COUNT(*) AS recentHires FROM employees WHERE hire_date >= ?',
      [cutoff]
    );

    res.json({
      totalEmployees: total,
      activeEmployees: active,
      departments: depts,
      recentHires,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Helper: map snake_case DB row → camelCase object ───────────────────────────
function toEmployee(row) {
  if (!row) return null;
  return {
    id:         row.id,
    firstName:  row.first_name,
    lastName:   row.last_name,
    email:      row.email,
    phone:      row.phone,
    position:   row.position,
    department: row.department,
    status:     row.status,
    hireDate:   row.hire_date,
    salary:     parseFloat(row.salary),
    address:    row.address,
  };
}

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getHRStats };
