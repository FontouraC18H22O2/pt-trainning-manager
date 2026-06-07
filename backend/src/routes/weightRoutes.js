const express = require('express');
const router = express.Router();
const weightController = require('../controllers/weightController');

router.post('/log', weightController.logWeight);
router.get('/history', weightController.getWeightHistory);

module.exports = router;