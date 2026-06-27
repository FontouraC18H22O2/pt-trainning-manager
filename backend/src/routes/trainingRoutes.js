const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const protect = require('../middlewares/authMiddleware');

// ── Biblioteca de exercícios / GIFs ──────────────────────────
router.get('/gifs', protect, trainingController.getAllGifs);

// ── Rotas públicas (sem autenticação — link WhatsApp) ────────
//  NOVO: Todos os planos do aluno por studentId
router.get('/public/student/:studentId', trainingController.getPublicPlansByStudent);
// Legado: plano por planId
router.get('/public/:planId', trainingController.getPublicPlan);

// ── Planos de treino por aluno ───────────────────────────────
router.get('/student/:studentId/plans', protect, trainingController.getPlansByStudent);
router.get('/student/:studentId', protect, trainingController.getPlanByStudent);
router.post('/', protect, trainingController.saveTrainingPlan);
router.delete('/plan/:planId', protect, trainingController.deletePlan);

// ── Calendário / Agenda ──────────────────────────────────────
router.get('/schedule', protect, trainingController.getSchedule);
router.post('/schedule', protect, trainingController.createSchedule);
router.delete('/schedule/:scheduleId', protect, trainingController.deleteSchedule);

module.exports = router;