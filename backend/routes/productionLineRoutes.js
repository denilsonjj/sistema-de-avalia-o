const express = require('express');
const router = express.Router();
const lineController = require('../controllers/productionLineController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas para gerenciar linhas de produção e suas associações
router.get('/', authMiddleware, lineController.getAllLines);
router.get('/user/:userId', authMiddleware, lineController.getLinesForUser);
router.post('/user/:userId', authMiddleware, lineController.updateUserLines);
router.get('/line/:lineName/users', authMiddleware, lineController.getUsersForLine);
module.exports = router;