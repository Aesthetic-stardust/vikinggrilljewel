const pool = require('../config/db');

const getAllPayroll = async (req, res, next) => {
  try {
    const { employeeId, period, status } = req.query;

    // Employees see only their own records
    const effectiveEmployeeId =
      req.user.role === 'employee' ? req.user.employeeId : (employeeId || null);

    let sql = `
      SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, e.position
      FROM payroll p
      JOIN employees e ON e.id = p.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (effectiveEmployeeId) { sql += ' AND p.employee_id = ?'; params.push(effectiveEmployeeId); }
    if (period)              { sql += ' AND p.period = ?';      params.push(period); }
    if (status)              { sql += ' AND p.status = ?';      params.push(status); }

    sql += ' ORDER BY p.processed_date DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(toPayroll));
  } catch (err) {
    next(err);
  }
};

const getPayslip = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*,
              e.first_name, e.last_name, e.email, e.phone,
              e.position, e.department, e.hire_date, e.salary AS base_salary
       FROM payroll p
       JOIN employees e ON e.id = p.employee_id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Payslip not found.' });

    const row = rows[0];
    const payslip = toPayroll(row);
    payslip.employee = {
      id:         row.employee_id,
      firstName:  row.first_name,
      lastName:   row.last_name,
      email:      row.email,
      phone:      row.phone,
      position:   row.position,
      department: row.department,
      hireDate:   row.hire_date,
      salary:     parseFloat(row.base_salary),
    };

    res.json(payslip);
  } catch (err) {
    next(err);
  }
};

const processPayroll = async (req, res, next) => {
  try {
    const { employeeId, period, basicPay, overtime, allowances, sss, philhealth, pagibig, tax } = req.body;
    if (!employeeId || !period || basicPay === undefined) {
      return res.status(400).json({ message: 'employeeId, period, and basicPay are required.' });
    }

    const grossPay    = (basicPay || 0) + (overtime || 0) + (allowances || 0);
    const deductions  = (sss || 0) + (philhealth || 0) + (pagibig || 0) + (tax || 0);
    const netPay      = grossPay - deductions;
    const processedDate = new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO payroll
         (employee_id, period, basic_pay, overtime, allowances, sss, philhealth, pagibig, tax, net_pay, status, processed_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
       ON DUPLICATE KEY UPDATE
         basic_pay      = VALUES(basic_pay),
         overtime       = VALUES(overtime),
         allowances     = VALUES(allowances),
         sss            = VALUES(sss),
         philhealth     = VALUES(philhealth),
         pagibig        = VALUES(pagibig),
         tax            = VALUES(tax),
         net_pay        = VALUES(net_pay),
         processed_date = VALUES(processed_date)`,
      [
        employeeId, period,
        basicPay || 0, overtime || 0, allowances || 0,
        sss || 0, philhealth || 0, pagibig || 0, tax || 0,
        netPay, processedDate,
      ]
    );

    const [rows] = await pool.query(
      `SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, e.position
       FROM payroll p JOIN employees e ON e.id = p.employee_id
       WHERE p.employee_id = ? AND p.period = ?`,
      [employeeId, period]
    );

    res.status(201).json(toPayroll(rows[0]));
  } catch (err) {
    next(err);
  }
};

const updatePayrollStatus = async (req, res, next) => {
  try {
    const [check] = await pool.query('SELECT id FROM payroll WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ message: 'Payroll record not found.' });

    const newStatus = req.body.status || 'paid';
    await pool.query('UPDATE payroll SET status = ? WHERE id = ?', [newStatus, req.params.id]);

    const [rows] = await pool.query(
      `SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, e.position
       FROM payroll p JOIN employees e ON e.id = p.employee_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    res.json(toPayroll(rows[0]));
  } catch (err) {
    next(err);
  }
};

const getPayrollSummary = async (req, res, next) => {
  try {
    const [[summary]] = await pool.query(`
      SELECT
        ROUND(SUM(basic_pay + overtime + allowances), 2)        AS totalGross,
        ROUND(SUM(sss + philhealth + pagibig + tax), 2)         AS totalDeductions,
        ROUND(SUM(net_pay), 2)                                  AS totalNetPay,
        SUM(status = 'paid')                                    AS paidCount,
        SUM(status = 'pending')                                 AS pendingCount,
        COUNT(*)                                                AS totalRecords
      FROM payroll
    `);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────────
function toPayroll(row) {
  if (!row) return null;
  return {
    id:             row.id,
    employeeId:     row.employee_id,
    employeeName:   row.employee_name || undefined,
    position:       row.position      || undefined,
    period:         row.period,
    basicPay:       parseFloat(row.basic_pay),
    overtime:       parseFloat(row.overtime),
    allowances:     parseFloat(row.allowances),
    sss:            parseFloat(row.sss),
    philhealth:     parseFloat(row.philhealth),
    pagibig:        parseFloat(row.pagibig),
    tax:            parseFloat(row.tax),
    netPay:         parseFloat(row.net_pay),
    status:         row.status,
    processedDate:  row.processed_date,
  };
}

module.exports = { getAllPayroll, getPayslip, processPayroll, updatePayrollStatus, getPayrollSummary };
