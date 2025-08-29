// backend/routes/goalRoutes.js

const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para PMM ver todas as metas da equipe
router.get('/', authMiddleware, goalController.getAllGoals);

// Rota para um usuário específico ver as suas próprias metas
router.get('/user/:userId', authMiddleware, goalController.getGoalsForUser);

// Rota para criar uma nova meta
router.post('/', authMiddleware, goalController.createGoal);

// Rota para atualizar o status de uma meta
router.put('/:id/status', authMiddleware, goalController.updateGoalStatus);

// Rota para apagar uma meta
router.delete('/:id', authMiddleware, goalController.deleteGoal);

module.exports = router;