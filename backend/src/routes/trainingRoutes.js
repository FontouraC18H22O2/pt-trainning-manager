const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const protect = require('../middlewares/authMiddleware');

router.get('/gifs', protect, trainingController.getAllGifs);
router.get('/student/:studentId', protect, trainingController.getPlanByStudent);
router.post('/', protect, trainingController.saveTrainingPlan);

router.get('/public/:planId', trainingController.getPublicPlan);

module.exports = router;