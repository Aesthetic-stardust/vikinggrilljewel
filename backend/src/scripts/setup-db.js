/**
 * Viking Grill — Database Setup Script
 *
 * Creates all required tables in the configured MySQL database.
 * Run once before starting the server:
 *
 *   node src/scripts/setup-db.js
 *
 * Make sure your .env file has the correct DB_* variables set first.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setup() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const DB = process.env.DB_NAME || 'vikinggrill';

  console.log(`\n🔧  Setting up database: ${DB}\n`);

  // ─── Create database ──────────────────────────────────────────────────────────
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\``);
  await connection.query(`USE \`${DB}\``);

  // ─── users ────────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(120)  NOT NULL,
      email       VARCHAR(191)  NOT NULL UNIQUE,
      password    VARCHAR(255)  NOT NULL,
      role        ENUM('hr_staff','management','employee','accounting_staff') NOT NULL,
      employee_id VARCHAR(50)   DEFAULT NULL,
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('  ✓ users');

  // ─── employees ───────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      first_name  VARCHAR(80)   NOT NULL,
      last_name   VARCHAR(80)   NOT NULL,
      email       VARCHAR(191)  NOT NULL UNIQUE,
      phone       VARCHAR(30)   DEFAULT '',
      position    VARCHAR(100)  NOT NULL,
      department  VARCHAR(100)  NOT NULL,
      status      ENUM('active','inactive') DEFAULT 'active',
      hire_date   DATE          DEFAULT NULL,
      salary      DECIMAL(12,2) DEFAULT 0.00,
      address     TEXT          DEFAULT NULL,
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('  ✓ employees');

  // ─── attendance ───────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      employee_id  INT UNSIGNED  NOT NULL,
      date         DATE          NOT NULL,
      time_in      TIME          DEFAULT NULL,
      time_out     TIME          DEFAULT NULL,
      status       ENUM('present','absent','late','half-day') NOT NULL,
      hours_worked DECIMAL(5,2)  DEFAULT 0.00,
      created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_emp_date (employee_id, date),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('  ✓ attendance');

  // ─── schedules ────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      employee_id  INT UNSIGNED NOT NULL,
      week         VARCHAR(10)  NOT NULL COMMENT 'ISO week, e.g. 2026-W41',
      monday       VARCHAR(20)  DEFAULT 'Off',
      tuesday      VARCHAR(20)  DEFAULT 'Off',
      wednesday    VARCHAR(20)  DEFAULT 'Off',
      thursday     VARCHAR(20)  DEFAULT 'Off',
      friday       VARCHAR(20)  DEFAULT 'Off',
      saturday     VARCHAR(20)  DEFAULT 'Off',
      sunday       VARCHAR(20)  DEFAULT 'Off',
      created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_emp_week (employee_id, week),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('  ✓ schedules');

  // ─── payroll ─────────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS payroll (
      id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      employee_id     INT UNSIGNED  NOT NULL,
      period          VARCHAR(60)   NOT NULL COMMENT 'e.g. October 1-15, 2026',
      basic_pay       DECIMAL(12,2) DEFAULT 0.00,
      overtime        DECIMAL(12,2) DEFAULT 0.00,
      allowances      DECIMAL(12,2) DEFAULT 0.00,
      sss             DECIMAL(12,2) DEFAULT 0.00,
      philhealth      DECIMAL(12,2) DEFAULT 0.00,
      pagibig         DECIMAL(12,2) DEFAULT 0.00,
      tax             DECIMAL(12,2) DEFAULT 0.00,
      net_pay         DECIMAL(12,2) DEFAULT 0.00,
      status          ENUM('pending','paid') DEFAULT 'pending',
      processed_date  DATE          DEFAULT NULL,
      created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_emp_period (employee_id, period),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('  ✓ payroll');

  // ─── transactions ─────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      date        DATE          NOT NULL,
      type        ENUM('income','expense') NOT NULL,
      category    VARCHAR(80)   NOT NULL,
      description TEXT          DEFAULT NULL,
      amount      DECIMAL(14,2) NOT NULL,
      reference   VARCHAR(80)   DEFAULT NULL,
      created_by  VARCHAR(50)   DEFAULT NULL,
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('  ✓ transactions');

  // ─── sales_records ────────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS sales_records (
      id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      date            DATE          NOT NULL,
      type            VARCHAR(40)   NOT NULL COMMENT 'e.g. Dine-in, Takeout',
      total_amount    DECIMAL(14,2) DEFAULT 0.00,
      orders_count    INT UNSIGNED  DEFAULT 0,
      avg_order_value DECIMAL(10,2) DEFAULT 0.00,
      pos_ref         VARCHAR(80)   DEFAULT NULL,
      created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('  ✓ sales_records');

  // ─── payment_records ──────────────────────────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS payment_records (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      date        DATE          NOT NULL,
      payee       VARCHAR(120)  NOT NULL,
      method      VARCHAR(40)   DEFAULT 'Cash',
      amount      DECIMAL(14,2) NOT NULL,
      category    VARCHAR(80)   NOT NULL,
      reference   VARCHAR(80)   DEFAULT NULL,
      status      ENUM('pending','completed','cancelled') DEFAULT 'pending',
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('  ✓ payment_records');

  // ─── Seed first admin user (HR) ───────────────────────────────────────────────
  const [existing] = await connection.query('SELECT id FROM users LIMIT 1');
  if (existing.length === 0) {
    const hashed = await bcrypt.hash('changeme123', 10);
    await connection.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Admin', 'admin@vikinggrill.com', hashed, 'hr_staff']
    );
    console.log('\n  ✓ Seeded initial admin user:');
    console.log('      Email:    admin@vikinggrill.com');
    console.log('      Password: changeme123');
    console.log('      Role:     hr_staff');
    console.log('      ⚠️  Change this password immediately after first login.\n');
  } else {
    console.log('\n  ℹ️  Users already exist — skipping seed.\n');
  }

  await connection.end();
  console.log('✅  Database setup complete.\n');
}

setup().catch((err) => {
  console.error('❌  Setup failed:', err.message);
  process.exit(1);
});
