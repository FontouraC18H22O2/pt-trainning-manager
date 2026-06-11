const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/authMiddleware');
const upload = require('../config/multer'); 

router.get('/', exerciseController.getAllExercises);

router.post(
  '/', 
  authMiddleware, 
  checkRole(['ADMIN', 'PT']), 
  upload.single('gif'), 
  exerciseController.createExercise
);

module.exports = router;