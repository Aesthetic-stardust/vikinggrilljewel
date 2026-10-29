const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllAttendance, recordAttendance, getAttendanceSummary } = require('../controllers/attendanceController');

router.use(authenticate);

router.get('/summary', authorize('hr_staff', 'management'), getAttendanceSummary);
router.get('/', authorize('hr_staff', 'management', 'employee'), getAllAttendance);
router.post('/', authorize('hr_staff'), recordAttendance);

module.exports = router;
