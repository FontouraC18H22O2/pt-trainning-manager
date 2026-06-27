const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const protect = require('../middlewares/authMiddleware');

// Rotas protegidas (PT autenticado)
router.get('/student/:studentId', protect, assessmentController.getAssessmentsByStudent);
router.post('/student/:studentId', protect, assessmentController.createAssessment);
router.delete('/:assessmentId', protect, assessmentController.deleteAssessment);

// Rota pública (para a página do aluno via WhatsApp)
router.get('/public/student/:studentId', assessmentController.getPublicAssessments);

module.exports = router;