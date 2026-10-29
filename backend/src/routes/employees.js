const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllEmployees, getEmployeeById, createEmployee,
  updateEmployee, deleteEmployee, getHRStats,
} = require('../controllers/employeeController');

router.use(authenticate);

router.get('/stats', authorize('hr_staff', 'management'), getHRStats);
router.get('/', authorize('hr_staff', 'management'), getAllEmployees);
router.get('/:id', authorize('hr_staff', 'management', 'employee'), getEmployeeById);
router.post('/', authorize('hr_staff'), createEmployee);
router.put('/:id', authorize('hr_staff'), updateEmployee);
router.delete('/:id', authorize('hr_staff'), deleteEmployee);

module.exports = router;
