const pool = require('../config/db');

// ─── Transactions ─────────────────────────────────────────────────────────────────

const getAllTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate } = req.query;

    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (type)      { sql += ' AND type = ?';       params.push(type); }
    if (category)  { sql += ' AND category = ?';   params.push(category); }
    if (startDate) { sql += ' AND date >= ?';       params.push(startDate); }
    if (endDate)   { sql += ' AND date <= ?';       params.push(endDate); }

    sql += ' ORDER BY date DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(toTransaction));
  } catch (err) {
    next(err);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { date, type, category, description, amount, reference } = req.body;
    if (!date || !type || !category || !amount) {
      return res.status(400).json({ message: 'date, type, category, and amount are required.' });
    }

    const ref = reference || `TXN-${Date.now()}`;
    const [result] = await pool.query(
      `INSERT INTO transactions (date, type, category, description, amount, reference, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, type, category, description || '', parseFloat(amount), ref, req.user.employeeId]
    );

    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    res.status(201).json(toTransaction(rows[0]));
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const [check] = await pool.query('SELECT id FROM transactions WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ message: 'Transaction not found.' });

    const { date, type, category, description, amount, reference } = req.body;
    await pool.query(
      `UPDATE transactions SET
         date        = COALESCE(?, date),
         type        = COALESCE(?, type),
         category    = COALESCE(?, category),
         description = COALESCE(?, description),
         amount      = COALESCE(?, amount),
         reference   = COALESCE(?, reference)
       WHERE id = ?`,
      [
        date        ?? null,
        type        ?? null,
        category    ?? null,
        description ?? null,
        amount      != null ? parseFloat(amount) : null,
        reference   ?? null,
        req.params.id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    res.json(toTransaction(rows[0]));
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const [check] = await pool.query('SELECT id FROM transactions WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ message: 'Transaction not found.' });

    await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── Sales Records ─────────────────────────────────────────────────────────────

const getAllSalesRecords = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    let sql = 'SELECT * FROM sales_records WHERE 1=1';
    const params = [];

    if (startDate) { sql += ' AND date >= ?';  params.push(startDate); }
    if (endDate)   { sql += ' AND date <= ?';  params.push(endDate); }
    if (type)      { sql += ' AND type = ?';   params.push(type); }

    sql += ' ORDER BY date DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(toSalesRecord));
  } catch (err) {
    next(err);
  }
};

const createSalesRecord = async (req, res, next) => {
  try {
    const { date, type, totalAmount, ordersCount, avgOrderValue, posRef } = req.body;
    if (!date || !type || totalAmount === undefined) {
      return res.status(400).json({ message: 'date, type, and totalAmount are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO sales_records (date, type, total_amount, orders_count, avg_order_value, pos_ref)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        date, type,
        parseFloat(totalAmount),
        ordersCount    || 0,
        avgOrderValue  != null ? parseFloat(avgOrderValue) : 0,
        posRef         || null,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM sales_records WHERE id = ?', [result.insertId]);
    res.status(201).json(toSalesRecord(rows[0]));
  } catch (err) {
    next(err);
  }
};

// ─── Payment Records ────────────────────────────────────────────────────────────

const getAllPaymentRecords = async (req, res, next) => {
  try {
    const { status, category, startDate, endDate } = req.query;

    let sql = 'SELECT * FROM payment_records WHERE 1=1';
    const params = [];

    if (status)    { sql += ' AND status = ?';    params.push(status); }
    if (category)  { sql += ' AND category = ?';  params.push(category); }
    if (startDate) { sql += ' AND date >= ?';      params.push(startDate); }
    if (endDate)   { sql += ' AND date <= ?';      params.push(endDate); }

    sql += ' ORDER BY date DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(toPayment));
  } catch (err) {
    next(err);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { date, payee, method, amount, category, reference } = req.body;
    if (!date || !payee || !amount || !category) {
      return res.status(400).json({ message: 'date, payee, amount, and category are required.' });
    }

    const ref = reference || `PAY-${Date.now()}`;
    const [result] = await pool.query(
      `INSERT INTO payment_records (date, payee, method, amount, category, reference, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [date, payee, method || 'Cash', parseFloat(amount), category, ref]
    );

    const [rows] = await pool.query('SELECT * FROM payment_records WHERE id = ?', [result.insertId]);
    res.status(201).json(toPayment(rows[0]));
  } catch (err) {
    next(err);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const [check] = await pool.query('SELECT id FROM payment_records WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ message: 'Payment not found.' });

    const newStatus = req.body.status || 'completed';
    await pool.query('UPDATE payment_records SET status = ? WHERE id = ?', [newStatus, req.params.id]);

    const [rows] = await pool.query('SELECT * FROM payment_records WHERE id = ?', [req.params.id]);
    res.json(toPayment(rows[0]));
  } catch (err) {
    next(err);
  }
};

// ─── Financial Summary & Stats ──────────────────────────────────────────────────

const getFinancialSummary = async (req, res, next) => {
  try {
    const [[income]]  = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE type='income'");
    const [[expense]] = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE type='expense'");
    const [[sales]]   = await pool.query('SELECT COALESCE(SUM(total_amount),0) AS total FROM sales_records');
    const [[payments]]= await pool.query('SELECT COALESCE(SUM(amount),0) AS total FROM payment_records');

    const [catRows] = await pool.query(`
      SELECT category, type, ROUND(SUM(amount),2) AS total
      FROM transactions
      GROUP BY category, type
    `);

    const byCategory = {};
    catRows.forEach(({ category, type, total }) => {
      if (!byCategory[category]) byCategory[category] = { income: 0, expense: 0 };
      byCategory[category][type] = parseFloat(total);
    });

    res.json({
      totalIncome:   parseFloat(income.total),
      totalExpenses: parseFloat(expense.total),
      netProfit:     parseFloat(income.total) - parseFloat(expense.total),
      totalSales:    parseFloat(sales.total),
      totalPayments: parseFloat(payments.total),
      byCategory,
    });
  } catch (err) {
    next(err);
  }
};

const getAccountingStats = async (req, res, next) => {
  try {
    const [[income]]   = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE type='income'");
    const [[expense]]  = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE type='expense'");
    const [[pending]]  = await pool.query("SELECT COUNT(*) AS cnt FROM payment_records WHERE status='pending'");
    const [[txCount]]  = await pool.query('SELECT COUNT(*) AS cnt FROM transactions');

    res.json({
      totalIncome:       parseFloat(income.total),
      totalExpenses:     parseFloat(expense.total),
      netProfit:         parseFloat(income.total) - parseFloat(expense.total),
      pendingPayments:   pending.cnt,
      totalTransactions: txCount.cnt,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────
function toTransaction(row) {
  if (!row) return null;
  return {
    id:          row.id,
    date:        row.date,
    type:        row.type,
    category:    row.category,
    description: row.description,
    amount:      parseFloat(row.amount),
    reference:   row.reference,
    createdBy:   row.created_by,
  };
}

function toSalesRecord(row) {
  if (!row) return null;
  return {
    id:            row.id,
    date:          row.date,
    type:          row.type,
    totalAmount:   parseFloat(row.total_amount),
    ordersCount:   row.orders_count,
    avgOrderValue: parseFloat(row.avg_order_value),
    posRef:        row.pos_ref,
  };
}

function toPayment(row) {
  if (!row) return null;
  return {
    id:        row.id,
    date:      row.date,
    payee:     row.payee,
    method:    row.method,
    amount:    parseFloat(row.amount),
    category:  row.category,
    reference: row.reference,
    status:    row.status,
  };
}

module.exports = {
  getAllTransactions, createTransaction, updateTransaction, deleteTransaction,
  getAllSalesRecords, createSalesRecord,
  getAllPaymentRecords, createPayment, updatePaymentStatus,
  getFinancialSummary, getAccountingStats,
};
