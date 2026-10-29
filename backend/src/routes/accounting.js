const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllTransactions, createTransaction, updateTransaction, deleteTransaction,
  getAllSalesRecords, createSalesRecord,
  getAllPaymentRecords, createPayment, updatePaymentStatus,
  getFinancialSummary, getAccountingStats,
} = require('../controllers/accountingController');

router.use(authenticate);

const accRoles = ['accounting_staff', 'management'];

router.get('/stats', authorize(...accRoles), getAccountingStats);
router.get('/summary', authorize(...accRoles), getFinancialSummary);

router.get('/transactions', authorize(...accRoles), getAllTransactions);
router.post('/transactions', authorize('accounting_staff'), createTransaction);
router.put('/transactions/:id', authorize('accounting_staff'), updateTransaction);
router.delete('/transactions/:id', authorize('accounting_staff'), deleteTransaction);

router.get('/sales', authorize(...accRoles), getAllSalesRecords);
router.post('/sales', authorize('accounting_staff'), createSalesRecord);

router.get('/payments', authorize(...accRoles), getAllPaymentRecords);
router.post('/payments', authorize('accounting_staff'), createPayment);
router.patch('/payments/:id/status', authorize('accounting_staff'), updatePaymentStatus);

module.exports = router;
