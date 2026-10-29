const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllPayroll, getPayslip, processPayroll, updatePayrollStatus, getPayrollSummary } = require('../controllers/payrollController');

router.use(authenticate);

router.get('/summary', authorize('hr_staff', 'management'), getPayrollSummary);
router.get('/', authorize('hr_staff', 'management', 'employee'), getAllPayroll);
router.get('/:id', authorize('hr_staff', 'management', 'employee'), getPayslip);
router.post('/', authorize('hr_staff'), processPayroll);
router.patch('/:id/status', authorize('hr_staff'), updatePayrollStatus);

module.exports = router;
