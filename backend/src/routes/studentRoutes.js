const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
// Comentado temporariamente para permitir os testes do CRUD sem JWT real:
// const { protect } = require('../middlewares/authMiddleware');

// Rotas abertas temporariamente para desenvolvimento
router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;