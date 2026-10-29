const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllSchedules, createOrUpdateSchedule, deleteSchedule } = require('../controllers/scheduleController');

router.use(authenticate);

router.get('/', authorize('hr_staff', 'management', 'employee'), getAllSchedules);
router.post('/', authorize('hr_staff'), createOrUpdateSchedule);
router.delete('/:id', authorize('hr_staff'), deleteSchedule);

module.exports = router;
