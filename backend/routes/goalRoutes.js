const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, goalController.createGoal);
router.get('/user/:userId', authMiddleware, goalController.getGoalsForUser);
router.put('/:id/status', authMiddleware, goalController.updateGoalStatus);
router.delete('/:id', authMiddleware, goalController.deleteGoal);

router.get('/', authMiddleware, goalController.getAllGoals);
router.post('/', authMiddleware, goalController.createGoal);

module.exports = router;